const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
}, { _id: true });

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['MULTIPLE_CHOICE', 'MULTI_SELECT', 'TRUE_FALSE'], default: 'MULTIPLE_CHOICE' },
  order: { type: Number, required: true },
  explanation: { type: String },
  options: { type: [optionSchema], required: true },
}, { _id: true });

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' },
  description: { type: String },
  category: { type: String },
  difficulty: { type: String },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT', index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  questions: { type: [questionSchema], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);