const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
  requester: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED'], 
    default: 'PENDING',
    index: true
  },
  message: { type: String }, // Optional message with friend request
}, { timestamps: true });

// Prevent duplicate friend requests
friendRequestSchema.index({ requester: 1, recipient: 1 }, { unique: true });

// Static method to find active requests between two users
friendRequestSchema.statics.findActiveRequest = async function(requesterId, recipientId) {
  return this.findOne({
    $or: [
      { requester: requesterId, recipient: recipientId, status: 'PENDING' },
      { requester: recipientId, recipient: requesterId, status: 'PENDING' }
    ]
  });
};

module.exports = mongoose.model('FriendRequest', friendRequestSchema);

