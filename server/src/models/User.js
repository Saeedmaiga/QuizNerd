const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  username: { type: String, unique: true, index: true, required: true },
  email: { type: String, unique: true, index: true, required: true },
  password: { type: String, required: true }, // Hashed password
  name: { type: String },
  
  // Legacy Auth0 support (optional, for migration)
  // Note: Not unique - multiple users can have null/undefined auth0Sub
  auth0Sub: { type: String, index: true, sparse: true },
  
  // User properties
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  
  // Friends system
  friends: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['PENDING', 'ACCEPTED', 'BLOCKED'], default: 'PENDING' },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
}, { timestamps: true });

// Normalize and hash before saving
userSchema.pre('save', async function(next) {
  // Normalize email to lowercase and trim
  if (this.isModified('email') && this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  
  // Normalize username (trim only, keep case for username)
  if (this.isModified('username') && this.username) {
    this.username = this.username.trim();
  }
  
  // Hash password if modified
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to get user without password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);