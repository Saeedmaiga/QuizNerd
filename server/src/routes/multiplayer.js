const express = require('express');
const router = express.Router();
const MultiplayerSession = require('../models/MultiplayerSession');
const { authenticateRequest } = require('../middleware/auth');

// Create a new multiplayer session
router.post('/create', authenticateRequest, async (req, res, next) => {
  try {
    const { userId, username, quizConfig, isPublic, visibility } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }

    const sessionCode = await MultiplayerSession.generateSessionCode();
    
    const session = new MultiplayerSession({
      sessionCode,
      hostId: userId,
      players: [{
        userId,
        username,
        isHost: true,
        score: 0,
        currentQuestion: 0,
      }],
      quizConfig: quizConfig || {
        source: 'opentdb',
        amount: 10,
        difficulty: 'medium',
      },
      isPublic: isPublic || false,
      visibility: visibility || (isPublic ? 'PUBLIC' : 'PRIVATE'),
      status: 'WAITING',
    });

    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      sessionId: session._id,
      status: session.status,
      isPublic: session.isPublic,
      visibility: session.visibility,
    });
  } catch (error) {
    next(error);
  }
});

// Join a session by code
router.post('/join', authenticateRequest, async (req, res, next) => {
  try {
    const { sessionCode, userId, username } = req.body;
    
    if (!sessionCode || !userId || !username) {
      return res.status(400).json({ error: 'Session code, user ID, and username are required' });
    }

    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Session already started' });
    }

    if (session.players.length >= session.maxPlayers) {
      return res.status(400).json({ error: 'Session is full' });
    }

    if (session.players.some(p => p.userId === userId)) {
      return res.status(400).json({ error: 'You are already in this session' });
    }

    session.players.push({
      userId,
      username,
      score: 0,
      currentQuestion: 0,
      isHost: false,
    });

    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      players: session.players,
      status: session.status,
    });
  } catch (error) {
    next(error);
  }
});

// Get session details
router.get('/session/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      sessionCode: session.sessionCode,
      hostId: session.hostId,
      players: session.players,
      status: session.status,
      maxPlayers: session.maxPlayers,
      quizConfig: session.quizConfig,
      questions: session.questions || [],
      startedAt: session.startedAt,
      isPublic: session.isPublic,
      visibility: session.visibility,
    });
  } catch (error) {
    next(error);
  }
});

// Start a session (host only)
router.post('/start/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId, questions } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can start the session' });
    }

    if (session.players.length < 1) {
      return res.status(400).json({ error: 'Need at least 1 player to start' });
    }

    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Session already started' });
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ error: 'Questions are required to start the session' });
    }

    session.status = 'IN_PROGRESS';
    session.questions = questions;
    session.startedAt = new Date();
    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      status: session.status,
      questions: session.questions,
      startedAt: session.startedAt,
    });
  } catch (error) {
    next(error);
  }
});

// Update player score/answer
router.post('/session/:sessionCode/answer', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId, questionIndex, answer, isCorrect } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const player = session.players.find(p => p.userId === userId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found in session' });
    }

    if (isCorrect) {
      player.score += 1;
    }
    player.currentQuestion = questionIndex + 1;

    if (player.currentQuestion >= session.questions.length) {
      player.finished = true;
    }

    await session.save();
    
    res.json({
      score: player.score,
      currentQuestion: player.currentQuestion,
      finished: player.finished,
    });
  } catch (error) {
    next(error);
  }
});

// Get leaderboard for a session
router.get('/session/:sessionCode/leaderboard', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const leaderboard = session.players
      .map(p => ({
        username: p.username,
        score: p.score,
        isHost: p.isHost,
        finished: p.finished,
        currentQuestion: p.currentQuestion,
      }))
      .sort((a, b) => b.score - a.score);
    
    res.json({ leaderboard });
  } catch (error) {
    next(error);
  }
});

// End session
router.post('/end/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can end the session' });
    }

    session.status = 'FINISHED';
    session.finishedAt = new Date();
    await session.save();
    
    res.json({ message: 'Session ended successfully' });
  } catch (error) {
    next(error);
  }
});

// Leave session
router.post('/leave/:sessionCode', async (req, res, next) => {
  try {
    const { sessionCode } = req.params;
    const { userId } = req.body;
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const playerIndex = session.players.findIndex(p => p.userId === userId);
    
    if (playerIndex === -1) {
      return res.status(404).json({ error: 'Player not found in session' });
    }

    session.players.splice(playerIndex, 1);

    // If host leaves and there are other players, make the next player the host
    if (session.players.length > 0 && session.hostId === userId) {
      session.hostId = session.players[0].userId;
      session.players[0].isHost = true;
    }

    await session.save();
    
    res.json({ message: 'Left session successfully' });
  } catch (error) {
    next(error);
  }
});

// Invite friends to session
router.post('/invite', authenticateRequest, async (req, res, next) => {
  try {
    const { sessionCode, userId, friendIds } = req.body;
    
    if (!sessionCode || !userId || !friendIds || !Array.isArray(friendIds)) {
      return res.status(400).json({ error: 'Session code, user ID, and friend IDs array are required' });
    }
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.hostId !== userId) {
      return res.status(403).json({ error: 'Only the host can invite friends' });
    }
    
    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Cannot invite to a session that has already started' });
    }
    
    // Get user info for invited players
    const User = require('../models/User');
    const mongoose = require('mongoose');
    
    // Find users by MongoDB _id or auth0Sub
    const invitedUsers = await User.find({
      $or: [
        { _id: { $in: friendIds.filter(id => mongoose.Types.ObjectId.isValid(id)) } },
        { auth0Sub: { $in: friendIds } }
      ]
    });
    
    // Add invitations
    const newInvitations = invitedUsers.map(user => ({
      userId: user._id.toString(),
      username: user.username || user.name || user.email || 'Unknown',
      status: 'PENDING'
    }));
    
    // Remove duplicates and already invited players
    const existingInvitedIds = session.invitedPlayers.map(inv => inv.userId);
    const newInvitationsFiltered = newInvitations.filter(
      inv => !existingInvitedIds.includes(inv.userId) && !session.players.some(p => p.userId === inv.userId)
    );
    
    session.invitedPlayers.push(...newInvitationsFiltered);
    await session.save();
    
    res.json({
      message: 'Invitations sent',
      invitedCount: newInvitationsFiltered.length,
      invitations: newInvitationsFiltered
    });
  } catch (error) {
    next(error);
  }
});

// Get user's pending invitations
router.get('/invitations/:userId', authenticateRequest, async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // Find all sessions where user is invited and status is PENDING
    const sessions = await MultiplayerSession.find({
      'invitedPlayers.userId': userId,
      'invitedPlayers.status': 'PENDING',
      status: 'WAITING' // Only show invitations for waiting sessions
    }).select('sessionCode hostId quizConfig status createdAt invitedPlayers');
    
    const invitations = sessions.map(session => {
      const invitation = session.invitedPlayers.find(inv => inv.userId === userId);
      return {
        sessionCode: session.sessionCode,
        hostId: session.hostId,
        quizConfig: session.quizConfig,
        status: session.status,
        invitedAt: invitation.invitedAt,
        createdAt: session.createdAt
      };
    });
    
    res.json({ invitations });
  } catch (error) {
    next(error);
  }
});

// Accept invitation
router.post('/accept-invitation', authenticateRequest, async (req, res, next) => {
  try {
    const { sessionCode, userId, username } = req.body;
    
    if (!sessionCode || !userId || !username) {
      return res.status(400).json({ error: 'Session code, user ID, and username are required' });
    }
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (session.status !== 'WAITING') {
      return res.status(400).json({ error: 'Session already started' });
    }
    
    // Find and update invitation
    const invitation = session.invitedPlayers.find(inv => inv.userId === userId && inv.status === 'PENDING');
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }
    
   
    if (session.players.some(p => p.userId === userId)) {
      invitation.status = 'ACCEPTED';
      await session.save();
      return res.json({
        message: 'Already in session',
        sessionCode: session.sessionCode,
        players: session.players,
        status: session.status,
      });
    }
    
    if (session.players.length >= session.maxPlayers) {
      return res.status(400).json({ error: 'Session is full' });
    }
    
  
    session.players.push({
      userId,
      username,
      score: 0,
      currentQuestion: 0,
      isHost: false,
    });
    
    invitation.status = 'ACCEPTED';
    await session.save();
    
    res.json({
      message: 'Invitation accepted',
      sessionCode: session.sessionCode,
      players: session.players,
      status: session.status,
    });
  } catch (error) {
    next(error);
  }
});

// Decline invitation
router.post('/decline-invitation', authenticateRequest, async (req, res, next) => {
  try {
    const { sessionCode, userId } = req.body;
    
    if (!sessionCode || !userId) {
      return res.status(400).json({ error: 'Session code and user ID are required' });
    }
    
    const session = await MultiplayerSession.findOne({ sessionCode });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const invitation = session.invitedPlayers.find(inv => inv.userId === userId && inv.status === 'PENDING');
    
    if (!invitation) {
      return res.status(404).json({ error: 'Invitation not found or already processed' });
    }
    
    invitation.status = 'DECLINED';
    await session.save();
    
    res.json({ message: 'Invitation declined' });
  } catch (error) {
    next(error);
  }
});

// Get public sessions (available for random players to join)
router.get('/public-sessions', async (req, res, next) => {
  try {
    const sessions = await MultiplayerSession.find({
      isPublic: true,
      visibility: 'PUBLIC',
      status: 'WAITING'
    })
    .select('sessionCode hostId players quizConfig maxPlayers createdAt')
    .sort({ createdAt: -1 })
    .limit(20);
    
    const publicSessions = sessions.map(session => ({
      sessionCode: session.sessionCode,
      hostId: session.hostId,
      playerCount: session.players.length,
      maxPlayers: session.maxPlayers,
      quizConfig: session.quizConfig,
      createdAt: session.createdAt,
    }));
    
    res.json({ sessions: publicSessions, count: publicSessions.length });
  } catch (error) {
    next(error);
  }
});

// Join a random public session
router.post('/join-public', authenticateRequest, async (req, res, next) => {
  try {
    const { userId, username } = req.body;
    
    if (!userId || !username) {
      return res.status(400).json({ error: 'User ID and username are required' });
    }
    
   
    const session = await MultiplayerSession.findOne({
      isPublic: true,
      visibility: 'PUBLIC',
      status: 'WAITING',
      $expr: { $lt: [{ $size: '$players' }, '$maxPlayers'] }
    }).sort({ createdAt: -1 });
    
    if (!session) {
      return res.status(404).json({ error: 'No public sessions available' });
    }
    
  
    if (session.players.some(p => p.userId === userId)) {
      return res.json({
        sessionCode: session.sessionCode,
        players: session.players,
        status: session.status,
        message: 'Already in this session',
      });
    }
    
    session.players.push({
      userId,
      username,
      score: 0,
      currentQuestion: 0,
      isHost: false,
    });
    
    await session.save();
    
    res.json({
      sessionCode: session.sessionCode,
      players: session.players,
      status: session.status,
      quizConfig: session.quizConfig,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
