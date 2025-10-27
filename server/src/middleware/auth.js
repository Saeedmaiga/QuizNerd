// Simple no-op auth middleware for development
const requireAuth = (req, res, next) => next();

// Simple auth middleware for multiplayer
const authenticateRequest = (req, res, next) => {
  next();
};

module.exports = { requireAuth, authenticateRequest };