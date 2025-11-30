const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const { authenticateRequest } = require('../middleware/auth');
const mongoose = require('mongoose');

// Helper function to find user by ID (supports both MongoDB _id and auth0Sub)
const findUserById = async (userId) => {
  if (!userId) return null;
  
  // Try MongoDB ObjectId first
  if (mongoose.Types.ObjectId.isValid(userId)) {
    const user = await User.findById(userId);
    if (user) return user;
  }
  
  // Try auth0Sub (for backward compatibility)
  return await User.findOne({ auth0Sub: userId });
};

// Search users by username or email
router.get('/search', authenticateRequest, async (req, res, next) => {
  try {
    const { query, userId } = req.query;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Find current user
    const currentUser = await findUserById(userId);
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Search for users by username or email (excluding current user)
    const searchRegex = new RegExp(query, 'i');
    const users = await User.find({
      _id: { $ne: currentUser._id },
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { name: searchRegex }
      ]
    }).select('username email name _id').limit(20);
    
    // Format users to include userId
    const formattedUsers = users.map(user => ({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      name: user.name,
    }));
    
    res.json({ users: formattedUsers });
  } catch (error) {
    next(error);
  }
});

// Send friend request
router.post('/request', authenticateRequest, async (req, res, next) => {
  try {
    const { userId, friendId, message } = req.body;
    
    if (!userId || !friendId) {
      return res.status(400).json({ error: 'User ID and friend ID are required' });
    }
    
    if (userId === friendId) {
      return res.status(400).json({ error: 'Cannot send friend request to yourself' });
    }
    
    // Find both users
    const requester = await findUserById(userId);
    const recipient = await findUserById(friendId);
    
    if (!requester || !recipient) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if already friends
    const existingFriend = requester.friends.find(
      f => f.userId.toString() === recipient._id.toString() && f.status === 'ACCEPTED'
    );
    
    if (existingFriend) {
      return res.status(400).json({ error: 'Already friends with this user' });
    }
    
    // Check for existing pending request
    const existingRequest = await FriendRequest.findActiveRequest(requester._id, recipient._id);
    
    if (existingRequest) {
      return res.status(400).json({ error: 'Friend request already exists' });
    }
    
    // Create friend request
    const friendRequest = new FriendRequest({
      requester: requester._id,
      recipient: recipient._id,
      message: message || '',
      status: 'PENDING'
    });
    
    await friendRequest.save();
    
    // Add to requester's friends list with PENDING status
    requester.friends.push({
      userId: recipient._id,
      status: 'PENDING',
      requestedBy: requester._id
    });
    await requester.save();
    
    res.json({
      message: 'Friend request sent',
      requestId: friendRequest._id
    });
  } catch (error) {
    next(error);
  }
});

// Get pending friend requests (received)
router.get('/requests', authenticateRequest, async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get pending requests where user is the recipient
    const requests = await FriendRequest.find({
      recipient: user._id,
      status: 'PENDING'
    }).populate('requester', 'username email name _id').sort({ createdAt: -1 });
    
    res.json({ requests });
  } catch (error) {
    next(error);
  }
});

// Accept friend request
router.post('/accept', authenticateRequest, async (req, res, next) => {
  try {
    const { userId, requestId } = req.body;
    
    if (!userId || !requestId) {
      return res.status(400).json({ error: 'User ID and request ID are required' });
    }
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const request = await FriendRequest.findById(requestId).populate('requester recipient');
    
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    if (request.recipient._id.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to accept this request' });
    }
    
    if (request.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not pending' });
    }
    
    // Update request status
    request.status = 'ACCEPTED';
    await request.save();
    
    // Update recipient's friends list
    const recipientFriend = user.friends.find(
      f => f.userId.toString() === request.requester._id.toString()
    );
    
    if (recipientFriend) {
      recipientFriend.status = 'ACCEPTED';
    } else {
      user.friends.push({
        userId: request.requester._id,
        status: 'ACCEPTED',
        requestedBy: request.requester._id
      });
    }
    await user.save();
    
    // Update requester's friends list
    const requesterFriend = request.requester.friends.find(
      f => f.userId.toString() === user._id.toString()
    );
    
    if (requesterFriend) {
      requesterFriend.status = 'ACCEPTED';
    } else {
      request.requester.friends.push({
        userId: user._id,
        status: 'ACCEPTED',
        requestedBy: request.requester._id
      });
    }
    await request.requester.save();
    
    res.json({
      message: 'Friend request accepted',
      friend: {
        userId: request.requester._id.toString(),
        username: request.requester.username,
        name: request.requester.name,
        email: request.requester.email
      }
    });
  } catch (error) {
    next(error);
  }
});

// Decline friend request
router.post('/decline', authenticateRequest, async (req, res, next) => {
  try {
    const { userId, requestId } = req.body;
    
    if (!userId || !requestId) {
      return res.status(400).json({ error: 'User ID and request ID are required' });
    }
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const request = await FriendRequest.findById(requestId);
    
    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }
    
    if (request.recipient.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to decline this request' });
    }
    
    // Update request status
    request.status = 'DECLINED';
    await request.save();
    
    // Remove from recipient's friends list
    user.friends = user.friends.filter(
      f => f.userId.toString() !== request.requester.toString()
    );
    await user.save();
    
    res.json({ message: 'Friend request declined' });
  } catch (error) {
    next(error);
  }
});

// Get all friends
router.get('/', authenticateRequest, async (req, res, next) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.populate('friends.userId', 'username email name _id');
    
    // Filter only accepted friends
    const friends = user.friends
      .filter(f => f.status === 'ACCEPTED' && f.userId)
      .map(f => ({
        userId: f.userId._id.toString(),
        username: f.userId.username,
        name: f.userId.name,
        email: f.userId.email,
        addedAt: f.createdAt
      }));
    
    res.json({ friends });
  } catch (error) {
    next(error);
  }
});

// Remove friend
router.delete('/:friendId', authenticateRequest, async (req, res, next) => {
  try {
    const { userId } = req.body;
    const { friendId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const user = await findUserById(userId);
    const friend = await findUserById(friendId);
    
    if (!user || !friend) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove from user's friends list
    user.friends = user.friends.filter(
      f => f.userId.toString() !== friend._id.toString()
    );
    await user.save();
    
    // Remove from friend's friends list
    friend.friends = friend.friends.filter(
      f => f.userId.toString() !== user._id.toString()
    );
    await friend.save();
    
    // Update or delete friend requests
    await FriendRequest.updateMany(
      {
        $or: [
          { requester: user._id, recipient: friend._id },
          { requester: friend._id, recipient: user._id }
        ]
      },
      { status: 'CANCELLED' }
    );
    
    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

