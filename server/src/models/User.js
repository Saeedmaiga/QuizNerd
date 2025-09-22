const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Sub: { type: String, unique: true, index: true, required: true },
  email: { type: String, index: true },
  name: { type: String },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);