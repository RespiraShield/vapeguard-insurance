const mongoose = require('mongoose');

const billPhotoSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // File Details
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^image\/(jpeg|jpg|png|gif|webp)$/i.test(v);
      },
      message: 'Only image files are allowed'
    }
  },
  size: {
    type: Number,
    required: true,
    max: [5 * 1024 * 1024, 'File size cannot exceed 5MB'] // 5MB limit
  },
  path: {
    type: String,
    required: true
  },
  
  // File Status
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'verified', 'rejected'],
    default: 'uploaded'
  },
  
  // Verification Details
  verification: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: String, // Admin/System ID
    verifiedAt: Date,
    rejectionReason: String,
    notes: String
  },
  
  // File Metadata
  metadata: {
    dimensions: {
      width: Number,
      height: Number
    },
    fileHash: String, // For duplicate detection
    uploadSource: {
      type: String,
      default: 'web'
    }
  }
}, {
  timestamps: true
});

// Indexes
billPhotoSchema.index({ userId: 1 });
billPhotoSchema.index({ applicationId: 1 });
billPhotoSchema.index({ status: 1 });
billPhotoSchema.index({ 'metadata.fileHash': 1 });
billPhotoSchema.index({ createdAt: -1 });

// Virtual for file URL (if using cloud storage)
billPhotoSchema.virtual('fileUrl').get(function() {
  // This would be implemented based on your file storage solution
  return `/uploads/bills/${this.filename}`;
});

// Instance methods
billPhotoSchema.methods.markVerified = function(verifiedBy, notes) {
  this.status = 'verified';
  this.verification.isVerified = true;
  this.verification.verifiedBy = verifiedBy;
  this.verification.verifiedAt = new Date();
  this.verification.notes = notes;
  return this.save();
};

billPhotoSchema.methods.markRejected = function(reason, rejectedBy) {
  this.status = 'rejected';
  this.verification.isVerified = false;
  this.verification.rejectionReason = reason;
  this.verification.verifiedBy = rejectedBy;
  this.verification.verifiedAt = new Date();
  return this.save();
};

// Static methods
billPhotoSchema.statics.findByApplication = function(applicationId) {
  return this.findOne({ applicationId }).populate('userId', 'name email');
};

billPhotoSchema.statics.getPendingVerifications = function() {
  return this.find({ status: 'uploaded' })
    .populate('userId', 'name email')
    .populate('applicationId', 'applicationNumber')
    .sort({ createdAt: 1 });
};

module.exports = mongoose.model('BillPhoto', billPhotoSchema);
