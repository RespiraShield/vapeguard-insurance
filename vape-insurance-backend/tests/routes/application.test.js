const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const applicationRoutes = require('../../src/routes/application');
const Application = require('../../src/models/Application');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/application', applicationRoutes);

describe('Application Routes', () => {
  describe('POST /api/application/personal-details', () => {
    test('should create application with valid personal details', async () => {
      const personalDetails = global.testUtils.createValidPersonalDetails();

      const response = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Personal details saved successfully');
      expect(response.body.data).toHaveProperty('applicationId');
      expect(response.body.data).toHaveProperty('applicationNumber');
      expect(response.body.data.personalDetails.name).toBe(personalDetails.name);

      // Verify in database
      const application = await Application.findById(response.body.data.applicationId);
      expect(application).toBeTruthy();
      expect(application.personalDetails.name).toBe(personalDetails.name);
      expect(application.status).toBe('draft');
    });

    test('should reject invalid personal details', async () => {
      const invalidDetails = {
        name: 'J', // Too short
        dob: '1990-01-01',
        city: 'mumbai'
      };

      const response = await request(app)
        .post('/api/application/personal-details')
        .send(invalidDetails)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    test('should reject underage applicant', async () => {
      const underageDetails = {
        name: 'John Doe',
        dob: '2010-01-01', // Under 18
        city: 'mumbai'
      };

      const response = await request(app)
        .post('/api/application/personal-details')
        .send(underageDetails)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should calculate age correctly', async () => {
      const personalDetails = {
        name: 'John Doe',
        dob: '1985-06-15',
        city: 'mumbai'
      };

      const response = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      const expectedAge = Math.floor((Date.now() - new Date('1985-06-15').getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      expect(response.body.data.personalDetails.age).toBe(expectedAge);
    });
  });

  describe('PUT /api/application/:id/insurance', () => {
    let applicationId;

    beforeEach(async () => {
      // Create a test application
      const application = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails()
      });
      const savedApplication = await application.save();
      applicationId = savedApplication._id;
    });

    test('should update application with valid insurance selection', async () => {
      const insuranceData = { selectedInsurance: 1 };

      const response = await request(app)
        .put(`/api/application/${applicationId}/insurance`)
        .send(insuranceData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Insurance plan selected successfully');
      expect(response.body.data.insuranceDetails.selectedPlan).toBe(1);
      expect(response.body.data.insuranceDetails.planName).toBe('Basic Respiratory Care');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.insuranceDetails.selectedPlan).toBe(1);
    });

    test('should reject invalid insurance plan', async () => {
      const invalidData = { selectedInsurance: 5 }; // Invalid plan

      const response = await request(app)
        .put(`/api/application/${applicationId}/insurance`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent application', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const insuranceData = { selectedInsurance: 1 };

      const response = await request(app)
        .put(`/api/application/${nonExistentId}/insurance`)
        .send(insuranceData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });

    test('should validate all insurance plans', async () => {
      const validPlans = [1, 2, 3];
      
      for (const planId of validPlans) {
        const response = await request(app)
          .put(`/api/application/${applicationId}/insurance`)
          .send({ selectedInsurance: planId })
          .expect(200);

        expect(response.body.data.insuranceDetails.selectedPlan).toBe(planId);
      }
    });
  });

  describe('PUT /api/application/:id/payment', () => {
    let applicationId;

    beforeEach(async () => {
      const application = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails(),
        insuranceDetails: {
          selectedPlan: 1,
          planName: 'Basic Respiratory Care',
          planPrice: '₹149/purchase'
        }
      });
      const savedApplication = await application.save();
      applicationId = savedApplication._id;
    });

    test('should update application with UPI payment details', async () => {
      const paymentData = global.testUtils.createValidPaymentDetails('upi');

      const response = await request(app)
        .put(`/api/application/${applicationId}/payment`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment details saved successfully');
      expect(response.body.data.paymentDetails.method).toBe('upi');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentDetails.method).toBe('upi');
      expect(application.paymentDetails.upiId).toBe('john@paytm');
      expect(application.status).toBe('payment_pending');
    });

    test('should update application with net banking details', async () => {
      const paymentData = global.testUtils.createValidPaymentDetails('netbanking');

      const response = await request(app)
        .put(`/api/application/${applicationId}/payment`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentDetails.method).toBe('netbanking');
      expect(application.paymentDetails.selectedBank).toBe('sbi');
      expect(application.paymentDetails.accountNumber).toBe('123456789012');
    });

    test('should update application with card payment details', async () => {
      const paymentData = global.testUtils.createValidPaymentDetails('razorpay');

      const response = await request(app)
        .put(`/api/application/${applicationId}/payment`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentDetails.method).toBe('razorpay');
      expect(application.paymentDetails.cardNumber).toBe('4111111111111111');
      expect(application.paymentDetails.cardholderName).toBe('John Doe');
    });

    test('should reject invalid payment details', async () => {
      const invalidData = {
        paymentMethod: 'upi'
        // Missing upiId
      };

      const response = await request(app)
        .put(`/api/application/${applicationId}/payment`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/application/:id/submit', () => {
    let completeApplication;

    beforeEach(async () => {
      completeApplication = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails(),
        billPhoto: {
          filename: 'test-bill.jpg',
          originalName: 'bill.jpg',
          mimetype: 'image/jpeg',
          size: 1024
        },
        insuranceDetails: {
          selectedPlan: 1,
          planName: 'Basic Respiratory Care',
          planPrice: '₹149/purchase'
        },
        paymentDetails: global.testUtils.createValidPaymentDetails('upi')
      });
      await completeApplication.save();
    });

    test('should submit complete application', async () => {
      const response = await request(app)
        .post(`/api/application/${completeApplication._id}/submit`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Application submitted successfully');
      expect(response.body.data.status).toBe('submitted');
      expect(response.body.data.submittedAt).toBeDefined();

      // Verify in database
      const application = await Application.findById(completeApplication._id);
      expect(application.status).toBe('submitted');
      expect(application.submittedAt).toBeDefined();
    });

    test('should reject incomplete application', async () => {
      const incompleteApplication = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails()
        // Missing other required fields
      });
      await incompleteApplication.save();

      const response = await request(app)
        .post(`/api/application/${incompleteApplication._id}/submit`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Application is incomplete');
    });
  });

  describe('GET /api/application/:id', () => {
    let applicationId;

    beforeEach(async () => {
      const application = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails(),
        insuranceDetails: {
          selectedPlan: 1,
          planName: 'Basic Respiratory Care',
          planPrice: '₹149/purchase'
        }
      });
      const savedApplication = await application.save();
      applicationId = savedApplication._id;
    });

    test('should get application by ID', async () => {
      const response = await request(app)
        .get(`/api/application/${applicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(applicationId.toString());
      expect(response.body.data.personalDetails.name).toBe('John Doe');
      expect(response.body.data.insuranceDetails.selectedPlan).toBe(1);
    });

    test('should not return sensitive payment information', async () => {
      // Add payment details to application
      const application = await Application.findById(applicationId);
      application.paymentDetails = {
        method: 'upi',
        upiId: 'john@paytm'
      };
      await application.save();

      const response = await request(app)
        .get(`/api/application/${applicationId}`)
        .expect(200);

      expect(response.body.data.paymentDetails).toBeUndefined();
    });

    test('should return 404 for non-existent application', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/application/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });
  });

  describe('GET /api/application/number/:applicationNumber', () => {
    let application;

    beforeEach(async () => {
      application = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails()
      });
      await application.save();
    });

    test('should get application by application number', async () => {
      const response = await request(app)
        .get(`/api/application/number/${application.applicationNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.applicationNumber).toBe(application.applicationNumber);
      expect(response.body.data.personalDetails.name).toBe('John Doe');
    });

    test('should handle case insensitive application number', async () => {
      const lowerCaseNumber = application.applicationNumber.toLowerCase();

      const response = await request(app)
        .get(`/api/application/number/${lowerCaseNumber}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.applicationNumber).toBe(application.applicationNumber);
    });

    test('should return 404 for non-existent application number', async () => {
      const response = await request(app)
        .get('/api/application/number/INVALID123')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });
  });
});
