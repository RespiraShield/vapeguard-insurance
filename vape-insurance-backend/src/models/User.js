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
  
  // Vaping Information
  vapingFrequencyValue: {
    type: Number,
    required: [true, 'Vaping frequency value is required'],
    min: [1, 'Vaping frequency must be at least 1'],
    max: [10000, 'Vaping frequency cannot exceed 10000'],
    validate: {
      validator: function(value) {
        const limits = {
          per_day: 30,
          per_week: 200,
          per_month: 900,
          per_year: 10000
        };
        const maxLimit = limits[this.vapingFrequencyCadence] || 10000;
        return value <= maxLimit;
      },
      message: function(props) {
        const limits = {
          per_day: 30,
          per_week: 200,
          per_month: 900,
          per_year: 10000
        };
        const maxLimit = limits[props.instance.vapingFrequencyCadence] || 10000;
        return `Maximum ${maxLimit} times ${props.instance.vapingFrequencyCadence ? props.instance.vapingFrequencyCadence.replace('_', ' ') : ''}`;
      }
    }
  },
  vapingFrequencyCadence: {
    type: String,
    required: [true, 'Vaping frequency cadence is required'],
    enum: {
      values: ['per_day', 'per_week', 'per_month', 'per_year'],
      message: 'Cadence must be one of: per_day, per_week, per_month, per_year'
    }
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
