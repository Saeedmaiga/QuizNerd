const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionIds: { type: [mongoose.Schema.Types.ObjectId], required: true },
  isCorrect: { type: Boolean, default: false },
  timeMs: { type: Number },
}, { _id: true });

const attemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', index: true, required: true },
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
  durationMs: { type: Number },
  answers: { type: [answerSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Attempt', attemptSchema);