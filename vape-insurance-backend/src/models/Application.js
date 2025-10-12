const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Reference to Insurance Plan
  insurancePlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsurancePlan',
    required: function() { return this.status === 'completed' || this.status === 'approved'; }
  },
  
  // Application Reference Number
  applicationNumber: {
    type: String,
    unique: true,
    sparse: true,
    required: function() { return this.status === 'completed' || this.status === 'approved'; }
  },

  // Application Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'payment_pending', 'completed', 'enrolled'],
    default: 'draft'
  },

  // Enrollment flag for pay-later feature
  isEnrolled: {
    type: Boolean,
    default: false
  },

  // Enrollment timestamp
  enrolledAt: Date,

  // Timestamps
  submittedAt: Date,
  completedAt: Date,

  // Email confirmation
  emailSent: {
    type: Boolean,
    default: false
  },

  // Additional metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
applicationSchema.index({ applicationNumber: 1 }, { sparse: true, unique: true });
applicationSchema.index({ userId: 1 });
applicationSchema.index({ insurancePlanId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ createdAt: -1 });

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  return Math.floor((Date.now() - this.createdAt.getTime()) / (24 * 60 * 60 * 1000));
});

// Virtual to populate related data
applicationSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

applicationSchema.virtual('insurancePlan', {
  ref: 'InsurancePlan',
  localField: 'insurancePlanId',
  foreignField: '_id',
  justOne: true
});

applicationSchema.virtual('verification', {
  ref: 'Verification',
  localField: '_id',
  foreignField: 'applicationId',
  justOne: true
});

applicationSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'applicationId',
  justOne: true
});

applicationSchema.virtual('billPhoto', {
  ref: 'BillPhoto',
  localField: '_id',
  foreignField: 'applicationId',
  justOne: true
});

// Pre-save middleware to generate application number
applicationSchema.pre('save', function(next) {
  if (!this.applicationNumber) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.applicationNumber = `VG${timestamp}${random}`.toUpperCase();
  }
  
  // Update completion timestamp
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update submission timestamp
  if (this.status === 'submitted' && !this.submittedAt) {
    this.submittedAt = new Date();
  }

  // Update enrollment timestamp and flag
  if (this.status === 'enrolled' && !this.enrolledAt) {
    this.enrolledAt = new Date();
    this.isEnrolled = true;
  }
  
  next();
});

// Instance methods
applicationSchema.methods.getFullDetails = async function() {
  await this.populate([
    { path: 'user', select: '-metadata' },
    { path: 'insurancePlan' },
    { path: 'verification' },
    { path: 'payment' },
    { path: 'billPhoto' }
  ]);
  return this;
};

applicationSchema.methods.canSubmit = async function() {
  const { isFeatureEnabled } = require('../config/featureFlags');
  const User = mongoose.model('User');
  
  // Get user and check email verification
  const user = await User.findById(this.userId);
  
  if (!user) {
    return false;
  }
  
  // Email verification is always required
  if (!user.emailVerified) {
    return false;
  }
  
  // Bill photo is only required if feature is enabled
  if (isFeatureEnabled('BILL_PHOTO_ENABLED')) {
    const billPhoto = await mongoose.model('BillPhoto').findOne({ applicationId: this._id });
    return billPhoto && billPhoto.status === 'uploaded';
  }
  
  // If bill photo feature is disabled, only email verification is required
  return true;
};

// Static methods
applicationSchema.statics.getApplicationStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0
      }
    }
  ]);
};

applicationSchema.statics.getRecentApplications = function(limit = 10) {
  return this.find()
    .populate('user', 'name email')
    .populate('insurancePlan', 'name price.displayPrice')
    .sort({ createdAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Application', applicationSchema);
