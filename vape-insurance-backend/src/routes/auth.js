const express = require('express');
const router = express.Router();
const { 
  checkUserExists,
  sendLoginOTP,
  verifyLoginOTP,
  getCurrentUser,
  refreshToken,
  logout
} = require('../handlers/authHandler');
const { authenticateToken, requireEmailVerified } = require('../middleware/auth');

// @desc    Health check for auth routes
// @route   GET /api/auth/health
// @access  Public
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

// @desc    Check if user exists by email
// @route   POST /api/auth/check-user
// @access  Public
router.post('/check-user', checkUserExists);

// @desc    Send login OTP to existing user
// @route   POST /api/auth/send-login-otp
// @access  Public
router.post('/send-login-otp', sendLoginOTP);

// @desc    Verify login OTP and get JWT token
// @route   POST /api/auth/verify-login-otp
// @access  Public
router.post('/verify-login-otp', verifyLoginOTP);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', authenticateToken, requireEmailVerified, getCurrentUser);

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Private (requires refresh token)
router.post('/refresh', refreshToken);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', authenticateToken, logout);

module.exports = router;
