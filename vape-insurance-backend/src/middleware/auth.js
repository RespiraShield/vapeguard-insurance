const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_key'
    );

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or inactive'
      });
    }

    // Add user info to request object
    req.user = {
      userId: user._id,
      email: user.email,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid access token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Access token expired'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to verify user email is verified
const requireEmailVerified = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email verification required'
      });
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification check failed'
    });
  }
};

module.exports = {
  authenticateToken,
  requireEmailVerified
};
