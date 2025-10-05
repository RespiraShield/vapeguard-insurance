const mongoose = require('mongoose');

const insurancePlanSchema = new mongoose.Schema({
  planId: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  billingCycle: {
    type: String,
    default: 'monthly'
  },
  features: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    enum: ['basic', 'premium', 'complete'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
insurancePlanSchema.index({ planId: 1 });
insurancePlanSchema.index({ isActive: 1 });
insurancePlanSchema.index({ sortOrder: 1 });

// Static method to get existing plans (removed unauthorized seeding)
insurancePlanSchema.statics.getExistingPlans = async function() {
  return await this.find({ isActive: true }).sort({ sortOrder: 1 });
};

module.exports = mongoose.model('InsurancePlan', insurancePlanSchema, 'insurancePlans');
