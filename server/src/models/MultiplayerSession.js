const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  score: { type: Number, default: 0 },
  isHost: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  currentQuestion: { type: Number, default: 0 },
  finished: { type: Boolean, default: false },
}, { _id: false });

const multiplayerSessionSchema = new mongoose.Schema({
  sessionCode: { type: String, unique: true, required: true, index: true },
  hostId: { type: String, required: true },
  players: { type: [playerSchema], default: [] },
  maxPlayers: { type: Number, default: 8 },
  status: { type: String, enum: ['WAITING', 'STARTING', 'IN_PROGRESS', 'FINISHED'], default: 'WAITING' },
  isPublic: { type: Boolean, default: false, index: true },
  visibility: { type: String, enum: ['PUBLIC', 'PRIVATE', 'FRIENDS_ONLY'], default: 'PRIVATE', index: true },
  quizConfig: {
    source: { type: String, default: 'opentdb' },
    amount: { type: Number, default: 10 },
    difficulty: { type: String, default: 'medium' },
    category: { type: String, default: null },
  },
  questions: [{ type: Object }],
  invitedPlayers: [{ 
    userId: { type: String, required: true },
    username: { type: String, required: true },
    invitedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'DECLINED'], default: 'PENDING' }
  }],
  startedAt: { type: Date },
  finishedAt: { type: Date },
}, { timestamps: true });

// Generate unique session code
multiplayerSessionSchema.statics.generateSessionCode = async function() {
  let code;
  do {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (await this.findOne({ sessionCode: code }));
  return code;
};

module.exports = mongoose.model('MultiplayerSession', multiplayerSessionSchema);
