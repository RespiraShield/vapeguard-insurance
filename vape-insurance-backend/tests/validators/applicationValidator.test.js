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
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyValue: 5,
        vapingFrequencyCadence: 'per_day'
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
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: '',
        vapingFrequencyValue: 5,
        vapingFrequencyCadence: 'per_day'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Please select your city from the dropdown');
    });

    test('should validate vaping frequency value', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyValue: 999,
        vapingFrequencyCadence: 'per_year'
      };

      const { error } = personalDetailsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject vaping frequency value below 1', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyValue: 0,
        vapingFrequencyCadence: 'per_day'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Vaping frequency must be at least 1');
    });

    test('should reject vaping frequency value above 999', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyValue: 1000,
        vapingFrequencyCadence: 'per_day'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Vaping frequency cannot exceed 999');
    });

    test('should accept missing vaping frequency value (now optional)', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyCadence: 'per_day'
      };

      const { error } = personalDetailsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should reject invalid vaping frequency cadence', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyValue: 5,
        vapingFrequencyCadence: 'per_hour'
      };

      const { error } = personalDetailsSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toContain('Cadence must be one of: per_day, per_week, per_month, per_year');
    });

    test('should accept missing vaping frequency cadence (now optional)', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai',
        vapingFrequencyValue: 5
      };

      const { error } = personalDetailsSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should accept all valid cadence values', () => {
      const cadences = ['per_day', 'per_week', 'per_month', 'per_year'];
      cadences.forEach(cadence => {
        const validData = {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '9876543210',
          dateOfBirth: '1990-01-01',
          city: 'Mumbai',
          vapingFrequencyValue: 5,
          vapingFrequencyCadence: cadence
        };
        const { error } = personalDetailsSchema.validate(validData);
        expect(error).toBeUndefined();
      });
    });

    test('should accept personal details without vaping frequency (now optional)', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '9876543210',
        dateOfBirth: '1990-01-01',
        city: 'Mumbai'
      };

      const { error } = personalDetailsSchema.validate(validData);
      expect(error).toBeUndefined();
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

    test('should accept any numeric plan ID', () => {
      const validData = { selectedInsurance: 999 };

      const { error } = insuranceSelectionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should accept missing selection (now optional)', () => {
      const validData = {};

      const { error } = insuranceSelectionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should accept null selection', () => {
      const validData = { selectedInsurance: null };

      const { error } = insuranceSelectionSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    test('should accept empty string selection', () => {
      const validData = { selectedInsurance: '' };

      const { error } = insuranceSelectionSchema.validate(validData);
      expect(error).toBeUndefined();
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
