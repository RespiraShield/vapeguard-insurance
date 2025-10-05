const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const loginOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  otp: {
    type: String,
    required: [true, 'OTP is required']
  },
  hashedOtp: {
    type: String,
    required: false // Will be populated by pre-save middleware
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
  },
  attempts: {
    type: Number,
    default: 0,
    max: [5, 'Maximum verification attempts exceeded']
  },
  verified: {
    type: Boolean,
    default: false
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Index for automatic cleanup of expired OTPs
loginOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient lookups
loginOTPSchema.index({ email: 1, verified: 1 });
loginOTPSchema.index({ createdAt: -1 });

// Pre-save middleware to hash OTP
loginOTPSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.hashedOtp = await bcrypt.hash(this.otp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to verify OTP
loginOTPSchema.methods.verifyOTP = async function(candidateOtp) {
  return await bcrypt.compare(candidateOtp, this.hashedOtp);
};

// Instance method to check if OTP is expired
loginOTPSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Instance method to increment attempts
loginOTPSchema.methods.incrementAttempts = function() {
  this.attempts += 1;
  return this.save();
};

// Static method to clean up old OTPs
loginOTPSchema.statics.cleanupExpired = function() {
  return this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
};

// Static method to find valid OTP for email
loginOTPSchema.statics.findValidOTP = function(email) {
  return this.findOne({
    email: email.toLowerCase(),
    verified: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 5 }
  }).sort({ createdAt: -1 });
};

module.exports = mongoose.model('LoginOTP', loginOTPSchema);
