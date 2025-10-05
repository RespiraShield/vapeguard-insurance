const Joi = require('joi');

// Personal Details Validation Schema
const personalDetailsSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      'string.empty': 'Full name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'string.pattern.base': 'Name can only contain letters and spaces'
    }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please enter a valid email address'
    }),

  phone: Joi.string()
    .trim()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid 10-digit Indian mobile number'
    }),
  
  dateOfBirth: Joi.date()
    .max('now')
    .required()
    .custom((value, helpers) => {
      const age = Math.floor((Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        return helpers.error('any.invalid', { message: 'You must be 18 years or older to apply for vape insurance' });
      }
      if (age > 100) {
        return helpers.error('any.invalid', { message: 'Please enter a valid date of birth' });
      }
      return value;
    })
    .messages({
      'date.base': 'Please enter a valid date of birth',
      'date.max': 'Date of birth cannot be in the future',
      'any.required': 'Date of birth is required'
    }),
  
  city: Joi.string()
    .trim()
    .required()
    .messages({
      'string.empty': 'Please select your city from the dropdown',
      'any.required': 'City is required'
    })
});

// Insurance Selection Validation Schema
const insuranceSelectionSchema = Joi.object({
  selectedInsurance: Joi.number()
    .integer()
    .valid(1, 2, 3)
    .required()
    .messages({
      'any.only': 'Please select a valid insurance plan',
      'any.required': 'Insurance plan selection is required'
    })
});

// Payment Details Validation Schema
const paymentDetailsSchema = Joi.object({
  paymentMethod: Joi.string()
    .valid('upi', 'netbanking', 'phonepe', 'gpay', 'paytm', 'wallet')
    .required()
    .messages({
      'any.only': 'Please select a valid payment method',
      'any.required': 'Payment method is required'
    }),
  
  // UPI validation
  upiId: Joi.when('paymentMethod', {
    is: 'upi',
    then: Joi.string()
      .pattern(/^[\w.-]+@[\w.-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Please enter a valid UPI ID (e.g., yourname@paytm)',
        'any.required': 'UPI ID is required'
      }),
    otherwise: Joi.string().optional()
  }),

  // Net Banking validation
  selectedBank: Joi.when('paymentMethod', {
    is: 'netbanking',
    then: Joi.string()
      .required()
      .messages({
        'any.required': 'Bank selection is required'
      }),
    otherwise: Joi.string().optional()
  }),

  accountNumber: Joi.when('paymentMethod', {
    is: 'netbanking',
    then: Joi.string()
      .pattern(/^\d{9,18}$/)
      .required()
      .messages({
        'string.pattern.base': 'Please enter a valid account number (9-18 digits)',
        'any.required': 'Account number is required'
      }),
    otherwise: Joi.string().optional()
  }),
  
});

// Complete Application Validation Schema
const completeApplicationSchema = Joi.object({
  personalDetails: personalDetailsSchema.required(),
  insuranceDetails: Joi.object({
    selectedPlan: Joi.number().integer().valid(1, 2, 3).required()
  }).required(),
  paymentDetails: paymentDetailsSchema.required()
});

// File Upload Validation
const fileUploadSchema = Joi.object({
  fieldname: Joi.string().valid('billPhoto').required(),
  originalname: Joi.string().required(),
  mimetype: Joi.string().valid('image/jpeg', 'image/jpg', 'image/png', 'image/gif').required(),
  size: Joi.number().max(10 * 1024 * 1024).required() // 10MB max
});

module.exports = {
  personalDetailsSchema,
  insuranceSelectionSchema,
  paymentDetailsSchema,
  completeApplicationSchema,
  fileUploadSchema
};
