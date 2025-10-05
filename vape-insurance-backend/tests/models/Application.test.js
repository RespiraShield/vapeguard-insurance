const Application = require('../../src/models/Application');

describe('Application Model', () => {
  describe('Validation', () => {
    test('should create application with valid data', async () => {
      const validData = {
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        },
        insuranceDetails: {
          selectedPlan: 1,
          planName: 'Basic Respiratory Care',
          planPrice: '₹149/purchase'
        },
        paymentDetails: {
          method: 'upi',
          upiId: 'john@paytm'
        }
      };

      const application = new Application(validData);
      const savedApplication = await application.save();

      expect(savedApplication._id).toBeDefined();
      expect(savedApplication.applicationNumber).toBeDefined();
      expect(savedApplication.personalDetails.name).toBe('John Doe');
      expect(savedApplication.personalDetails.age).toBe(35); // Calculated from DOB
      expect(savedApplication.status).toBe('draft');
    });

    test('should fail validation with invalid name', async () => {
      const invalidData = {
        personalDetails: {
          name: 'J', // Too short
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        }
      };

      const application = new Application(invalidData);
      
      await expect(application.save()).rejects.toThrow();
    });

    test('should fail validation with underage person', async () => {
      const invalidData = {
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('2010-01-01'), // Under 18
          city: 'mumbai'
        }
      };

      const application = new Application(invalidData);
      
      await expect(application.save()).rejects.toThrow();
    });

    test('should fail validation with invalid insurance plan', async () => {
      const invalidData = {
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        },
        insuranceDetails: {
          selectedPlan: 5, // Invalid plan ID
          planName: 'Invalid Plan'
        }
      };

      const application = new Application(invalidData);
      
      await expect(application.save()).rejects.toThrow();
    });

    test('should require UPI ID when payment method is UPI', async () => {
      const invalidData = {
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        },
        paymentDetails: {
          method: 'upi'
          // Missing upiId
        }
      };

      const application = new Application(invalidData);
      
      await expect(application.save()).rejects.toThrow();
    });

    test('should require bank details when payment method is netbanking', async () => {
      const invalidData = {
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        },
        paymentDetails: {
          method: 'netbanking'
          // Missing selectedBank and accountNumber
        }
      };

      const application = new Application(invalidData);
      
      await expect(application.save()).rejects.toThrow();
    });

    test('should require card details when payment method is razorpay', async () => {
      const invalidData = {
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        },
        paymentDetails: {
          method: 'razorpay'
          // Missing card details
        }
      };

      const application = new Application(invalidData);
      
      await expect(application.save()).rejects.toThrow();
    });
  });

  describe('Static Methods', () => {
    test('should return insurance plans', () => {
      const plans = Application.getInsurancePlans();
      
      expect(plans).toHaveLength(3);
      expect(plans[0]).toHaveProperty('id', 1);
      expect(plans[0]).toHaveProperty('name', 'Basic Respiratory Care');
      expect(plans[0]).toHaveProperty('price', '₹149/purchase');
      expect(plans[0]).toHaveProperty('features');
      expect(Array.isArray(plans[0].features)).toBe(true);
    });
  });

  describe('Instance Methods', () => {
    test('should get plan details for selected plan', async () => {
      const application = new Application({
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        },
        insuranceDetails: {
          selectedPlan: 2,
          planName: 'Premium Lung Shield',
          planPrice: '₹299/purchase'
        }
      });

      await application.save();
      
      const planDetails = application.getPlanDetails();
      expect(planDetails).toBeDefined();
      expect(planDetails.id).toBe(2);
      expect(planDetails.name).toBe('Premium Lung Shield');
    });
  });

  describe('Pre-save Middleware', () => {
    test('should generate application number automatically', async () => {
      const application = new Application({
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        }
      });

      await application.save();
      
      expect(application.applicationNumber).toBeDefined();
      expect(application.applicationNumber).toMatch(/^VG[A-Z0-9]+$/);
    });

    test('should calculate age from date of birth', async () => {
      const birthDate = new Date('1985-06-15');
      const application = new Application({
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: birthDate,
          city: 'mumbai'
        }
      });

      await application.save();
      
      const expectedAge = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      expect(application.personalDetails.age).toBe(expectedAge);
    });
  });

  describe('Indexes', () => {
    test('should have unique application number', async () => {
      const application1 = new Application({
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        }
      });

      const application2 = new Application({
        personalDetails: {
          name: 'Jane Doe',
          dateOfBirth: new Date('1992-01-01'),
          city: 'delhi'
        }
      });

      await application1.save();
      await application2.save();

      expect(application1.applicationNumber).not.toBe(application2.applicationNumber);
    });
  });

  describe('Virtual Properties', () => {
    test('should calculate application age', async () => {
      const application = new Application({
        personalDetails: {
          name: 'John Doe',
          dateOfBirth: new Date('1990-01-01'),
          city: 'mumbai'
        }
      });

      await application.save();
      
      expect(application.applicationAge).toBeDefined();
      expect(typeof application.applicationAge).toBe('number');
      expect(application.applicationAge).toBeGreaterThanOrEqual(0);
    });
  });
});
