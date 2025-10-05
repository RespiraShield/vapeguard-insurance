const request = require('supertest');
const express = require('express');
const crypto = require('crypto');
const paymentRoutes = require('../../src/routes/payment');
const Application = require('../../src/models/Application');

// Mock Razorpay
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 14900,
        currency: 'INR',
        receipt: 'receipt_test'
      })
    }
  }));
});

// Create test app
const app = express();
app.use(express.json());
app.use('/api/payment', paymentRoutes);

describe('Payment Routes', () => {
  let applicationId;
  let completeApplication;

  beforeEach(async () => {
    // Create a complete test application
    completeApplication = new Application({
      personalDetails: global.testUtils.createValidPersonalDetails(),
      insuranceDetails: {
        selectedPlan: 1,
        planName: 'Basic Respiratory Care',
        planPrice: '₹149/purchase',
        planFeatures: ['Lung function monitoring', 'Annual chest X-ray']
      },
      paymentDetails: global.testUtils.createValidPaymentDetails('upi')
    });
    await completeApplication.save();
    applicationId = completeApplication._id;
  });

  describe('POST /api/payment/create-order/:applicationId', () => {
    test('should create Razorpay order successfully', async () => {
      const response = await request(app)
        .post(`/api/payment/create-order/${applicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment order created successfully');
      expect(response.body.data.orderId).toBe('order_test123');
      expect(response.body.data.amount).toBe(14900);
      expect(response.body.data.currency).toBe('INR');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.transactionDetails.razorpayOrderId).toBe('order_test123');
      expect(application.transactionDetails.amount).toBe(149);
    });

    test('should return 404 for non-existent application', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/api/payment/create-order/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });

    test('should return 400 when insurance plan not selected', async () => {
      // Create application without insurance details
      const incompleteApp = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails()
      });
      await incompleteApp.save();

      const response = await request(app)
        .post(`/api/payment/create-order/${incompleteApp._id}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insurance plan not selected');
    });

    test('should handle different insurance plan amounts', async () => {
      const plans = [
        { id: 1, expectedAmount: 14900 },
        { id: 2, expectedAmount: 29900 },
        { id: 3, expectedAmount: 49900 }
      ];

      for (const plan of plans) {
        // Update application with different plan
        completeApplication.insuranceDetails.selectedPlan = plan.id;
        await completeApplication.save();

        const response = await request(app)
          .post(`/api/payment/create-order/${applicationId}`)
          .expect(200);

        expect(response.body.data.amount).toBe(plan.expectedAmount);
      }
    });
  });

  describe('POST /api/payment/verify/:applicationId', () => {
    beforeEach(async () => {
      // Set up application with order details
      completeApplication.transactionDetails = {
        razorpayOrderId: 'order_test123',
        amount: 149,
        currency: 'INR'
      };
      await completeApplication.save();
    });

    test('should verify payment successfully with valid signature', async () => {
      const paymentData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'valid_signature'
      };

      // Mock crypto.createHmac to return expected signature
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('valid_signature')
      };
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

      const response = await request(app)
        .post(`/api/payment/verify/${applicationId}`)
        .send(paymentData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment verified successfully');
      expect(response.body.data.paymentStatus).toBe('completed');
      expect(response.body.data.status).toBe('completed');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentStatus).toBe('completed');
      expect(application.status).toBe('completed');
      expect(application.transactionDetails.razorpayPaymentId).toBe('pay_test123');
      expect(application.transactionDetails.paidAt).toBeDefined();
      expect(application.completedAt).toBeDefined();

      // Restore crypto mock
      crypto.createHmac.mockRestore();
    });

    test('should reject payment with invalid signature', async () => {
      const paymentData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'invalid_signature'
      };

      // Mock crypto.createHmac to return different signature
      const mockHmac = {
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('expected_signature')
      };
      jest.spyOn(crypto, 'createHmac').mockReturnValue(mockHmac);

      const response = await request(app)
        .post(`/api/payment/verify/${applicationId}`)
        .send(paymentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid payment signature');

      // Restore crypto mock
      crypto.createHmac.mockRestore();
    });

    test('should return 404 for non-existent application', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const paymentData = {
        razorpay_order_id: 'order_test123',
        razorpay_payment_id: 'pay_test123',
        razorpay_signature: 'valid_signature'
      };

      const response = await request(app)
        .post(`/api/payment/verify/${nonExistentId}`)
        .send(paymentData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });
  });

  describe('POST /api/payment/failure/:applicationId', () => {
    test('should record payment failure', async () => {
      const failureData = {
        error_code: 'PAYMENT_FAILED',
        error_description: 'Insufficient funds'
      };

      const response = await request(app)
        .post(`/api/payment/failure/${applicationId}`)
        .send(failureData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment failure recorded');
      expect(response.body.data.paymentStatus).toBe('failed');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentStatus).toBe('failed');
      expect(application.transactionDetails.failureReason).toBe('Insufficient funds');
      expect(application.transactionDetails.errorCode).toBe('PAYMENT_FAILED');
    });

    test('should handle failure without error details', async () => {
      const response = await request(app)
        .post(`/api/payment/failure/${applicationId}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentStatus).toBe('failed');
      expect(application.transactionDetails.failureReason).toBe('Payment failed');
    });
  });

  describe('GET /api/payment/status/:applicationId', () => {
    test('should get payment status', async () => {
      // Set up payment details
      completeApplication.paymentStatus = 'completed';
      completeApplication.transactionDetails = {
        amount: 149,
        currency: 'INR',
        paidAt: new Date(),
        razorpayOrderId: 'order_test123'
      };
      await completeApplication.save();

      const response = await request(app)
        .get(`/api/payment/status/${applicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.paymentStatus).toBe('completed');
      expect(response.body.data.transactionDetails.amount).toBe(149);
      expect(response.body.data.transactionDetails.currency).toBe('INR');
      expect(response.body.data.transactionDetails.paidAt).toBeDefined();
    });

    test('should return 404 for non-existent application', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/payment/status/${nonExistentId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });
  });

  describe('POST /api/payment/process/:applicationId', () => {
    test('should process non-Razorpay payment successfully', async () => {
      const transactionData = {
        transactionId: 'TXN_TEST123',
        amount: 149
      };

      const response = await request(app)
        .post(`/api/payment/process/${applicationId}`)
        .send(transactionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Payment processed successfully');
      expect(response.body.data.paymentStatus).toBe('completed');
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.transactionId).toBe('TXN_TEST123');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.paymentStatus).toBe('completed');
      expect(application.status).toBe('completed');
      expect(application.transactionDetails.transactionId).toBe('TXN_TEST123');
      expect(application.transactionDetails.amount).toBe(149);
      expect(application.transactionDetails.paidAt).toBeDefined();
      expect(application.completedAt).toBeDefined();
    });

    test('should generate transaction ID if not provided', async () => {
      const transactionData = {
        amount: 149
      };

      const response = await request(app)
        .post(`/api/payment/process/${applicationId}`)
        .send(transactionData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.transactionId).toMatch(/^TXN_\d+$/);

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.transactionDetails.transactionId).toMatch(/^TXN_\d+$/);
    });

    test('should return 404 for non-existent application', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const transactionData = {
        transactionId: 'TXN_TEST123',
        amount: 149
      };

      const response = await request(app)
        .post(`/api/payment/process/${nonExistentId}`)
        .send(transactionData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });
  });
});
