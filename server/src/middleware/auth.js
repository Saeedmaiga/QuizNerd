const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT_SECRET should be set in environment variables for security
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}
// Fallback for development only
const JWT_SECRET_FINAL = JWT_SECRET || 'dev-secret-key-change-in-production';

// Authenticate request using JWT token
const authenticateRequest = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.body.token || 
                  req.query.token;
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET_FINAL);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Attach user info to request
    req.user = user;
    req.userId = user._id.toString();
    req.username = user.username;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    next(error);
  }
};

// Require authentication (same as authenticateRequest but with different name)
const requireAuth = authenticateRequest;

module.exports = { requireAuth, authenticateRequest };