const mongoose = require('mongoose');

/**
 * PreVerification Model
 * 
 * Purpose: Temporary email OTP storage BEFORE user registration
 * Lifecycle: Created when email OTP is sent, deleted after successful user creation
 * 
 * This is separate from Verification model because:
 * - No userId or applicationId exists yet (user hasn't registered)
 * - Temporary storage only (auto-deleted after 15 minutes)
 * - Only used for pre-registration email verification flow
 */
const preVerificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: false // Not required after verification
  },
  otpExpiry: {
    type: Date,
    required: false // Not required after verification
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  lastAttemptAt: Date
}, {
  timestamps: true
});

// TTL index to automatically delete expired OTPs after 15 minutes
preVerificationSchema.index({ otpExpiry: 1 }, { expireAfterSeconds: 900 });

// Index for quick email lookups
preVerificationSchema.index({ email: 1 });

module.exports = mongoose.model('PreVerification', preVerificationSchema);
