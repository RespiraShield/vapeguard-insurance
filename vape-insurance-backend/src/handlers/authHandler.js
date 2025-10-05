const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LoginOTP = require('../models/LoginOTP');
const rateLimit = require('express-rate-limit');

// Rate limiting for OTP requests
const otpRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    error: 'Too many OTP requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for OTP verification
const verifyRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 verification attempts per windowMs
  message: {
    success: false,
    error: 'Too many verification attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'fallback_secret_key',
    { expiresIn: '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  );
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Check if user exists by email
// @route   POST /api/auth/check-user
// @access  Public
const checkUserExists = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    res.json({
      success: true,
      data: {
        exists: !!user,
        user: user ? {
          _id: user._id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified
        } : null
      }
    });
  } catch (error) {
    console.error('Check user exists error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error occurred'
    });
  }
};

// @desc    Send login OTP to existing user
// @route   POST /api/auth/send-login-otp
// @access  Public
const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Check if user exists and is verified
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      emailVerified: true,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No verified account found with this email'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Save OTP to database
    const loginOTP = new LoginOTP({
      email: email.toLowerCase(),
      otp,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    await loginOTP.save();

    // Send OTP via integrated SendGrid service
    try {
      const emailService = require('../services/emailService');
      const emailResult = await emailService.sendLoginOTPEmail(
        email.toLowerCase(),
        user.name,
        otp,
        5
      );

      console.log(`✅ Login OTP email sent successfully via SendGrid to ${email}`);
    } catch (emailError) {
      console.error('❌ SendGrid login email failed:', emailError.message);
      
      // Fallback - show OTP in development only
      if (process.env.NODE_ENV === 'development') {
        console.log(`Login OTP for ${email}: ${otp}`);
      } else {
        throw emailError;
      }
    }

    res.json({
      success: true,
      data: {
        message: 'OTP sent successfully to your email'
      }
    });
  } catch (error) {
    console.error('Send login OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send OTP'
    });
  }
};

// @desc    Verify login OTP and return JWT token
// @route   POST /api/auth/verify-login-otp
// @access  Public
const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP are required'
      });
    }

    // Find valid OTP
    const loginOTP = await LoginOTP.findValidOTP(email.toLowerCase());

    if (!loginOTP) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is expired
    if (loginOTP.isExpired()) {
      return res.status(400).json({
        success: false,
        error: 'OTP has expired'
      });
    }

    // Verify OTP
    const isValidOTP = await loginOTP.verifyOTP(otp);

    if (!isValidOTP) {
      await loginOTP.incrementAttempts();
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Mark OTP as verified
    loginOTP.verified = true;
    await loginOTP.save();

    // Get user details
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      emailVerified: true,
      isActive: true
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User account not found'
      });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          city: user.city,
          age: user.age,
          isActive: user.isActive,
          emailVerified: user.emailVerified,
          emailVerifiedAt: user.emailVerifiedAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

// @desc    Refresh JWT token
// @route   POST /api/auth/refresh
// @access  Private (requires refresh token)
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
    );

    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Check if user still exists and is active
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'User account not found or inactive'
      });
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      data: {
        message: 'Logged out successfully'
      }
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
};

module.exports = {
  checkUserExists,
  sendLoginOTP: [otpRateLimit, sendLoginOTP],
  verifyLoginOTP: [verifyRateLimit, verifyLoginOTP],
  getCurrentUser,
  refreshToken,
  logout
};
