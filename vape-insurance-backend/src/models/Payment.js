const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  insurancePlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InsurancePlan',
    required: true
  },

  // Payment Details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['upi', 'phonepe', 'gpay', 'paytm', 'netbanking', 'card'],
    required: [true, 'Payment method is required']
  },
  
  // UPI Details (if applicable)
  upiId: {
    type: String,
    required: function() { return this.paymentMethod === 'upi'; }
  },

  // Net Banking Details (if applicable)
  selectedBank: {
    type: String,
    required: function() { return this.paymentMethod === 'netbanking'; }
  },
  
  accountNumber: {
    type: String,
    required: function() { return this.paymentMethod === 'netbanking'; }
  },

  // Transaction Details
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  
  // Payment Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Gateway Response
  gatewayResponse: {
    type: mongoose.Schema.Types.Mixed
  },
  
  // Failure Details
  failureReason: String,
  failureCode: String,
  
  // Timestamps
  initiatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  failedAt: Date,
  
  // Refund Details
  refund: {
    refundId: String,
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    }
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1 });
paymentSchema.index({ applicationId: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

// Pre-save middleware to generate transaction ID
paymentSchema.pre('save', function(next) {
  if (!this.transactionId && this.status !== 'pending') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 8);
    this.transactionId = `TXN${timestamp}${random}`.toUpperCase();
  }
  
  // Update completion timestamp
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Update failure timestamp
  if (this.status === 'failed' && !this.failedAt) {
    this.failedAt = new Date();
  }
  
  next();
});

// Instance methods
paymentSchema.methods.markCompleted = function(gatewayResponse = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

paymentSchema.methods.markFailed = function(reason, code, gatewayResponse = {}) {
  this.status = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  this.failureCode = code;
  this.gatewayResponse = gatewayResponse;
  return this.save();
};

paymentSchema.methods.initiateRefund = function(amount, reason) {
  this.refund = {
    refundAmount: amount || this.amount,
    refundReason: reason,
    refundStatus: 'pending'
  };
  return this.save();
};

// Static methods
paymentSchema.statics.getPaymentStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
};

module.exports = mongoose.model('Payment', paymentSchema);
