const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
  },
  dateOfBirth: {
    type: Date,
    required: [true, 'Date of birth is required'],
    validate: {
      validator: function(value) {
        const age = Math.floor((Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 18 && age <= 100;
      },
      message: 'Age must be between 18 and 100 years'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  age: {
    type: Number
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    registrationSource: {
      type: String,
      default: 'web'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for user age calculation
userSchema.virtual('currentAge').get(function() {
  if (this.dateOfBirth) {
    return Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
  return this.age;
});

// Pre-save middleware to calculate age
userSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    const age = Math.floor((Date.now() - this.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    this.age = age;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
