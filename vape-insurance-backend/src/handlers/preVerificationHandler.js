const User = require('../models/User');
const PreVerification = require('../models/PreVerification');
const emailService = require('../services/emailService');

class PreVerificationHandler {
  // Send Email OTP before user registration
  async sendEmailOTP(req, res) {
    try {
      const { email, name } = req.body;

      // Validate email
      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter a valid email address'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if email already exists and is verified
      const existingUser = await User.findOne({ 
        email: normalizedEmail,
        emailVerified: true 
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered and verified. Please use a different email address.',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }

      // Find or create pre-verification record
      let preVerification = await PreVerification.findOne({ email: normalizedEmail });
      
      if (!preVerification) {
        preVerification = new PreVerification({ email: normalizedEmail });
      }

      // Check if too many attempts
      if (preVerification.attempts >= 5 && !preVerification.verified) {
        return res.status(429).json({
          success: false,
          error: 'Maximum OTP attempts exceeded. Please try again later.'
        });
      }

      // Generate new OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      preVerification.otp = otp;
      preVerification.otpExpiry = expiryTime;
      preVerification.attempts = 0; // Reset attempts on new OTP request
      preVerification.verified = false;

      await preVerification.save();

      // Send email via SendGrid
      try {
        const emailResult = await emailService.sendOTPEmail(
          normalizedEmail,
          name || 'User',
          otp,
          10
        );

        console.log(`✅ OTP email sent successfully to ${normalizedEmail}`);
        res.json({
          success: true,
          message: 'OTP sent successfully to your email',
          debug: process.env.NODE_ENV === 'development' ? { 
            otp,
            expiresAt: expiryTime,
            messageId: emailResult.messageId
          } : undefined
        });
      } catch (emailError) {
        console.error('❌ SendGrid email failed:', emailError.message);
        
        // In development, still return success with OTP for testing
        if (process.env.NODE_ENV === 'development') {
          console.log(`Development OTP for ${normalizedEmail}: ${otp}`);
          res.json({
            success: true,
            message: 'OTP sent successfully (development mode - check console)',
            debug: { 
              otp,
              expiresAt: expiryTime,
              error: emailError.message 
            }
          });
        } else {
          throw emailError;
        }
      }
    } catch (error) {
      console.error('Error in sendEmailOTP:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send OTP. Please try again.'
      });
    }
  }

  // Verify Email OTP before user registration
  async verifyEmailOTP(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          error: 'Email and OTP are required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      
      // Check if email was registered by another user after OTP was sent
      const existingUser = await User.findOne({ 
        email: normalizedEmail,
        emailVerified: true 
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered and verified. Please use a different email address.',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }

      const preVerification = await PreVerification.findOne({ email: normalizedEmail });

      if (!preVerification) {
        return res.status(400).json({
          success: false,
          error: 'No OTP found for this email. Please request a new OTP.'
        });
      }

      // Check if already verified
      if (preVerification.verified) {
        return res.json({
          success: true,
          message: 'Email already verified'
        });
      }

      // Check expiry
      if (new Date() > preVerification.otpExpiry) {
        return res.status(400).json({
          success: false,
          error: 'OTP has expired. Please request a new OTP.'
        });
      }

      // Check max attempts
      if (preVerification.attempts >= 5) {
        return res.status(400).json({
          success: false,
          error: 'Too many failed attempts. Please request a new OTP.'
        });
      }

      // Increment attempts
      preVerification.attempts += 1;
      preVerification.lastAttemptAt = new Date();

      // Verify OTP
      if (preVerification.otp !== otp) {
        await preVerification.save();
        return res.status(400).json({
          success: false,
          error: `Invalid OTP. ${5 - preVerification.attempts} attempts remaining.`
        });
      }

      // OTP is valid - mark as verified
      preVerification.verified = true;
      preVerification.verifiedAt = new Date();
      preVerification.otp = undefined; // Clear OTP after successful verification
      
      await preVerification.save();

      res.json({
        success: true,
        message: 'Email verified successfully'
      });
    } catch (error) {
      console.error('Error in verifyEmailOTP:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to verify OTP. Please try again.'
      });
    }
  }

  // Check if email is verified
  async checkEmailVerified(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const preVerification = await PreVerification.findOne({ email: normalizedEmail });

      res.json({
        success: true,
        data: {
          verified: preVerification?.verified || false,
          verifiedAt: preVerification?.verifiedAt
        }
      });
    } catch (error) {
      console.error('Error in checkEmailVerified:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check verification status'
      });
    }
  }

  // Check if email exists in User collection
  async checkEmailExists(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email is required'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findOne({ 
        email: normalizedEmail,
        emailVerified: true 
      });

      res.json({
        success: true,
        data: {
          exists: !!existingUser,
          verified: existingUser?.emailVerified || false
        }
      });
    } catch (error) {
      console.error('Error in checkEmailExists:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check email'
      });
    }
  }
}

module.exports = new PreVerificationHandler();
