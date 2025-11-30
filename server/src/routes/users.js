const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Import JWT_SECRET from middleware to keep it consistent
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? null : 'dev-secret-key-change-in-production');
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

// Register new user
router.post('/register', async (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().min(3).max(30),
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().optional(),
    });

    let { username, email, password, name } = schema.parse(req.body);

    // Trim and normalize inputs
    username = username.trim();
    email = email.toLowerCase().trim();
    if (name) name = name.trim();

    // Normalize for comparison (email is already lowercased on line 27)
    const normalizedEmail = email; // Already lowercased and trimmed
    const normalizedUsername = username.toLowerCase().trim();
    
    // Get all users and check for duplicates in memory
    const allUsers = await User.find({}).select('username email _id');
    
    // Check for duplicates by comparing normalized values
    const existingByEmail = allUsers.find(u => {
      if (!u.email) return false;
      return u.email.toLowerCase().trim() === normalizedEmail;
    });
    
    const existingByUsername = allUsers.find(u => {
      if (!u.username) return false;
      return u.username.toLowerCase().trim() === normalizedUsername;
    });

    if (existingByEmail) {
      return res.status(400).json({ 
        error: 'Email already registered',
        details: `The email "${normalizedEmail}" is already in use.`
      });
    }
    
    if (existingByUsername) {
      return res.status(400).json({ 
        error: 'Username already taken',
        details: `The username "${username}" is already taken.`
      });
    }

    // Create new user with normalized data
    // Don't set auth0Sub at all - let it be undefined (sparse index won't index undefined values)
    const user = new User({
      username,
      email: email.toLowerCase(), // Store email in lowercase
      password, // Will be hashed by pre-save hook
      name: name || username,
      emailVerified: false,
      // Don't set auth0Sub - omit it entirely so it's undefined (not null)
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    if (error.code === 11000) {
      // MongoDB duplicate key error - extract which field caused it
      const duplicateField = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
      
      // Handle auth0Sub errors specially (users don't provide this, so it's a system error)
      if (duplicateField === 'auth0Sub') {
        return res.status(400).json({ 
          error: 'Registration failed',
          details: 'There was an issue creating your account. Please try again or contact support.'
        });
      }
      
      // For email and username, provide user-friendly messages
      const fieldName = duplicateField === 'email' ? 'Email' : duplicateField === 'username' ? 'Username' : 'Username or email';
      return res.status(400).json({ 
        error: `${fieldName} already exists`,
        details: `The ${duplicateField} you provided is already registered.`
      });
    }
    next(error);
  }
});

// Login user
router.post('/login', async (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().min(1),
      password: z.string().min(1),
    });

    let { username, password } = schema.parse(req.body);

    // Trim and normalize username (could be email or username)
    username = username.trim();

    // Find user by username or email (case-insensitive for email)
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id.toString(),
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
});

// Get current user (requires authentication)
router.get('/me', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified,
      }
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    next(error);
  }
});

// Get user by ID (for friends system)
router.get('/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('username email name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

