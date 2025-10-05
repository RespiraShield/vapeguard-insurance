const {
  personalDetailsSchema,
  insuranceSelectionSchema,
  paymentDetailsSchema,
  completeApplicationSchema,
  fileUploadSchema
} = require('../../src/validators/applicationValidator');

describe('Application Validators', () => {
  describe('Personal Details Schema', () => {
    test('should validate correct personal details', () => {
      const validData = {
        name: 'John Doe',
        dob: '1990-01-01',
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject empty name', () => {
      const invalidData = {
        name: '',
        dob: '1990-01-01',
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Full name is required');
    });

    test('should reject name with numbers', () => {
      const invalidData = {
        name: 'John123',
        dob: '1990-01-01',
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Name can only contain letters and spaces');
    });

    test('should reject name that is too short', () => {
      const invalidData = {
        name: 'J',
        dob: '1990-01-01',
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Name must be at least 2 characters long');
    });

    test('should reject future date of birth', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      
      const invalidData = {
        name: 'John Doe',
        dob: futureDate.toISOString().split('T')[0],
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Date of birth cannot be in the future');
    });

    test('should reject underage person', () => {
      const underageDate = new Date();
      underageDate.setFullYear(underageDate.getFullYear() - 16);
      
      const invalidData = {
        name: 'John Doe',
        dob: underageDate.toISOString().split('T')[0],
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('You must be 18 years or older');
    });

    test('should reject very old age', () => {
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 120);
      
      const invalidData = {
        name: 'John Doe',
        dob: veryOldDate.toISOString().split('T')[0],
        city: 'mumbai'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Please enter a valid date of birth');
    });

    test('should reject empty city', () => {
      const invalidData = {
        name: 'John Doe',
        dob: '1990-01-01',
        city: ''
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Please select your city from the dropdown');
    });
  });

  describe('Insurance Selection Schema', () => {
    test('should validate correct insurance selection', () => {
      const validData = { selectedInsurance: 1 };

      const { error } = insuranceSelectionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should accept all valid plan IDs', () => {
      [1, 2, 3].forEach(planId => {
        const { error } = insuranceSelectionSchema.validate({ selectedInsurance: planId });
        expect(error).toBeUndefined();
      });
    });

    test('should reject invalid plan ID', () => {
      const invalidData = { selectedInsurance: 4 };

      const { error } = insuranceSelectionSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Please select a valid insurance plan');
    });

    test('should reject missing selection', () => {
      const invalidData = {};

      const { error } = insuranceSelectionSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Insurance plan selection is required');
    });
  });

  describe('Payment Details Schema', () => {
    describe('UPI Payment', () => {
      test('should validate correct UPI payment', () => {
        const validData = {
          paymentMethod: 'upi',
          upiId: 'john@paytm'
        };

        const { error } = paymentDetailsSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should reject invalid UPI ID format', () => {
        const invalidData = {
          paymentMethod: 'upi',
          upiId: 'invalid-upi'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Please enter a valid UPI ID');
      });

      test('should reject missing UPI ID', () => {
        const invalidData = {
          paymentMethod: 'upi'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('UPI ID is required');
      });
    });

    describe('Net Banking Payment', () => {
      test('should validate correct net banking payment', () => {
        const validData = {
          paymentMethod: 'netbanking',
          selectedBank: 'sbi',
          accountNumber: '123456789012'
        };

        const { error } = paymentDetailsSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should reject invalid bank', () => {
        const invalidData = {
          paymentMethod: 'netbanking',
          selectedBank: 'invalid-bank',
          accountNumber: '123456789012'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Please select a valid bank');
      });

      test('should reject invalid account number format', () => {
        const invalidData = {
          paymentMethod: 'netbanking',
          selectedBank: 'sbi',
          accountNumber: '12345' // Too short
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Account number must be 9-18 digits');
      });
    });

    describe('Card Payment', () => {
      test('should validate correct card payment', () => {
        const validData = {
          paymentMethod: 'razorpay',
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123',
          cardholderName: 'John Doe'
        };

        const { error } = paymentDetailsSchema.validate(validData);
        expect(error).toBeUndefined();
      });

      test('should reject invalid card number', () => {
        const invalidData = {
          paymentMethod: 'razorpay',
          cardNumber: '1234', // Too short
          expiryDate: '12/25',
          cvv: '123',
          cardholderName: 'John Doe'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Please enter a valid 16-digit card number');
      });

      test('should reject invalid expiry date format', () => {
        const invalidData = {
          paymentMethod: 'razorpay',
          cardNumber: '4111111111111111',
          expiryDate: '1225', // Wrong format
          cvv: '123',
          cardholderName: 'John Doe'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Please enter expiry date in MM/YY format');
      });

      test('should reject expired card', () => {
        const invalidData = {
          paymentMethod: 'razorpay',
          cardNumber: '4111111111111111',
          expiryDate: '01/20', // Expired
          cvv: '123',
          cardholderName: 'John Doe'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Card has expired');
      });

      test('should reject invalid CVV', () => {
        const invalidData = {
          paymentMethod: 'razorpay',
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '12', // Too short
          cardholderName: 'John Doe'
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('CVV must be 3 digits');
      });

      test('should reject invalid cardholder name', () => {
        const invalidData = {
          paymentMethod: 'razorpay',
          cardNumber: '4111111111111111',
          expiryDate: '12/25',
          cvv: '123',
          cardholderName: 'J' // Too short
        };

        const { error } = paymentDetailsSchema.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toContain('Cardholder name must be at least 2 characters');
      });
    });

    test('should reject invalid payment method', () => {
      const invalidData = {
        paymentMethod: 'invalid-method'
      };

      const { error } = paymentDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Please select a valid payment method');
    });
  });

  describe('File Upload Schema', () => {
    test('should validate correct file upload', () => {
      const validData = {
        fieldname: 'billPhoto',
        originalname: 'bill.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024 // 1MB
      };

      const { error } = fileUploadSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid file type', () => {
      const invalidData = {
        fieldname: 'billPhoto',
        originalname: 'bill.pdf',
        mimetype: 'application/pdf',
        size: 1024 * 1024
      };

      const { error } = fileUploadSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject file too large', () => {
      const invalidData = {
        fieldname: 'billPhoto',
        originalname: 'bill.jpg',
        mimetype: 'image/jpeg',
        size: 15 * 1024 * 1024 // 15MB
      };

      const { error } = fileUploadSchema.validate(invalidData);
      expect(error).toBeDefined();
    });

    test('should reject wrong field name', () => {
      const invalidData = {
        fieldname: 'wrongField',
        originalname: 'bill.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024
      };

      const { error } = fileUploadSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });

  describe('Complete Application Schema', () => {
    test('should validate complete application', () => {
      const validData = {
        personalDetails: {
          name: 'John Doe',
          dob: '1990-01-01',
          city: 'mumbai'
        },
        selectedInsurance: 1,
        paymentDetails: {
          paymentMethod: 'upi',
          upiId: 'john@paytm'
        }
      };

      const { error } = completeApplicationSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject incomplete application', () => {
      const invalidData = {
        personalDetails: {
          name: 'John Doe',
          dob: '1990-01-01',
          city: 'mumbai'
        }
        // Missing selectedInsurance and paymentDetails
      };

      const { error } = completeApplicationSchema.validate(invalidData);
      expect(error).toBeDefined();
    });
  });
});
