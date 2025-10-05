const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');

// Import all routes
const applicationRoutes = require('../../src/routes/application');
const uploadRoutes = require('../../src/routes/upload');
const insuranceRoutes = require('../../src/routes/insurance');
const paymentRoutes = require('../../src/routes/payment');

// Create test app with all routes
const app = express();
app.use(express.json());
app.use('/api/application', applicationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/insurance', insuranceRoutes);
app.use('/api/payment', paymentRoutes);

describe('Complete Application Flow Integration Tests', () => {
  let applicationId;
  let applicationNumber;
  const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

  beforeAll(() => {
    // Create a test image file
    const testImageBuffer = Buffer.from('fake-image-data');
    const fixturesDir = path.dirname(testImagePath);
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true });
    }
    fs.writeFileSync(testImagePath, testImageBuffer);
  });

  afterAll(() => {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  afterEach(async () => {
    // Clean up uploaded files
    const uploadDir = 'uploads/bills';
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
  });

  describe('Complete Happy Path Flow', () => {
    test('should complete entire application process successfully', async () => {
      // Step 1: Submit personal details
      const personalDetails = global.testUtils.createValidPersonalDetails();
      
      const step1Response = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      expect(step1Response.body.success).toBe(true);
      applicationId = step1Response.body.data.applicationId;
      applicationNumber = step1Response.body.data.applicationNumber;

      // Step 2: Upload bill photo
      const uploadResponse = await request(app)
        .post(`/api/upload/bill-photo/${applicationId}`)
        .attach('billPhoto', testImagePath)
        .expect(200);

      expect(uploadResponse.body.success).toBe(true);

      // Step 3: Select insurance plan
      const insuranceResponse = await request(app)
        .put(`/api/application/${applicationId}/insurance`)
        .send({ selectedInsurance: 2 })
        .expect(200);

      expect(insuranceResponse.body.success).toBe(true);
      expect(insuranceResponse.body.data.insuranceDetails.selectedPlan).toBe(2);

      // Step 4: Submit payment details
      const paymentDetails = global.testUtils.createValidPaymentDetails('upi');
      
      const paymentResponse = await request(app)
        .put(`/api/application/${applicationId}/payment`)
        .send(paymentDetails)
        .expect(200);

      expect(paymentResponse.body.success).toBe(true);

      // Step 5: Process payment
      const processPaymentResponse = await request(app)
        .post(`/api/payment/process/${applicationId}`)
        .send({
          transactionId: 'TXN_INTEGRATION_TEST',
          amount: 299
        })
        .expect(200);

      expect(processPaymentResponse.body.success).toBe(true);
      expect(processPaymentResponse.body.data.paymentStatus).toBe('completed');

      // Step 6: Submit complete application
      const submitResponse = await request(app)
        .post(`/api/application/${applicationId}/submit`)
        .expect(200);

      expect(submitResponse.body.success).toBe(true);
      expect(submitResponse.body.data.status).toBe('submitted');

      // Step 7: Verify final application state
      const finalResponse = await request(app)
        .get(`/api/application/${applicationId}`)
        .expect(200);

      const finalApp = finalResponse.body.data;
      expect(finalApp.personalDetails.name).toBe(personalDetails.name);
      expect(finalApp.insuranceDetails.selectedPlan).toBe(2);
      expect(finalApp.billPhoto).toBeDefined();
      expect(finalApp.status).toBe('submitted');
      expect(finalApp.paymentStatus).toBe('completed');

      // Step 8: Verify application can be retrieved by number
      const byNumberResponse = await request(app)
        .get(`/api/application/number/${applicationNumber}`)
        .expect(200);

      expect(byNumberResponse.body.data.applicationNumber).toBe(applicationNumber);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle partial application completion', async () => {
      // Create application with only personal details
      const personalDetails = global.testUtils.createValidPersonalDetails();
      
      const step1Response = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      const partialAppId = step1Response.body.data.applicationId;

      // Try to submit incomplete application
      const submitResponse = await request(app)
        .post(`/api/application/${partialAppId}/submit`)
        .expect(400);

      expect(submitResponse.body.success).toBe(false);
      expect(submitResponse.body.error).toContain('Application is incomplete');
    });

    test('should handle invalid insurance plan selection', async () => {
      // Create application
      const personalDetails = global.testUtils.createValidPersonalDetails();
      
      const step1Response = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      const appId = step1Response.body.data.applicationId;

      // Try to select invalid insurance plan
      const insuranceResponse = await request(app)
        .put(`/api/application/${appId}/insurance`)
        .send({ selectedInsurance: 999 })
        .expect(400);

      expect(insuranceResponse.body.success).toBe(false);
    });

    test('should handle payment processing for different methods', async () => {
      const paymentMethods = ['upi', 'netbanking', 'razorpay'];
      
      for (const method of paymentMethods) {
        // Create new application for each payment method
        const personalDetails = global.testUtils.createValidPersonalDetails();
        
        const appResponse = await request(app)
          .post('/api/application/personal-details')
          .send(personalDetails)
          .expect(201);

        const appId = appResponse.body.data.applicationId;

        // Select insurance
        await request(app)
          .put(`/api/application/${appId}/insurance`)
          .send({ selectedInsurance: 1 })
          .expect(200);

        // Submit payment details for specific method
        const paymentDetails = global.testUtils.createValidPaymentDetails(method);
        
        const paymentResponse = await request(app)
          .put(`/api/application/${appId}/payment`)
          .send(paymentDetails)
          .expect(200);

        expect(paymentResponse.body.success).toBe(true);
        expect(paymentResponse.body.data.paymentDetails.method).toBe(method);
      }
    });

    test('should handle file upload edge cases', async () => {
      // Create application
      const personalDetails = global.testUtils.createValidPersonalDetails();
      
      const appResponse = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      const appId = appResponse.body.data.applicationId;

      // Test upload without file
      await request(app)
        .post(`/api/upload/bill-photo/${appId}`)
        .expect(400);

      // Test successful upload
      await request(app)
        .post(`/api/upload/bill-photo/${appId}`)
        .attach('billPhoto', testImagePath)
        .expect(200);

      // Test getting uploaded file info
      const fileInfoResponse = await request(app)
        .get(`/api/upload/bill-photo/${appId}`)
        .expect(200);

      expect(fileInfoResponse.body.success).toBe(true);
      expect(fileInfoResponse.body.data.billPhoto.filename).toBeDefined();

      // Test deleting uploaded file
      const deleteResponse = await request(app)
        .delete(`/api/upload/bill-photo/${appId}`)
        .expect(200);

      expect(deleteResponse.body.success).toBe(true);

      // Verify file is deleted
      await request(app)
        .get(`/api/upload/bill-photo/${appId}`)
        .expect(404);
    });
  });

  describe('Data Consistency and Validation', () => {
    test('should maintain data consistency across all operations', async () => {
      // Create application
      const personalDetails = {
        name: 'Integration Test User',
        dob: '1988-03-15',
        city: 'bangalore'
      };
      
      const appResponse = await request(app)
        .post('/api/application/personal-details')
        .send(personalDetails)
        .expect(201);

      const appId = appResponse.body.data.applicationId;

      // Verify personal details are stored correctly
      let getResponse = await request(app)
        .get(`/api/application/${appId}`)
        .expect(200);

      expect(getResponse.body.data.personalDetails.name).toBe(personalDetails.name);
      expect(getResponse.body.data.personalDetails.city).toBe(personalDetails.city);

      // Add insurance and verify
      await request(app)
        .put(`/api/application/${appId}/insurance`)
        .send({ selectedInsurance: 3 })
        .expect(200);

      getResponse = await request(app)
        .get(`/api/application/${appId}`)
        .expect(200);

      expect(getResponse.body.data.insuranceDetails.selectedPlan).toBe(3);
      expect(getResponse.body.data.insuranceDetails.planName).toBe('Complete Wellness Pro');

      // Add payment details and verify
      const paymentDetails = global.testUtils.createValidPaymentDetails('netbanking');
      
      await request(app)
        .put(`/api/application/${appId}/payment`)
        .send(paymentDetails)
        .expect(200);

      getResponse = await request(app)
        .get(`/api/application/${appId}`)
        .expect(200);

      expect(getResponse.body.data.status).toBe('payment_pending');
      // Payment details should not be returned in GET response for security
      expect(getResponse.body.data.paymentDetails).toBeUndefined();
    });

    test('should validate insurance plan pricing consistency', async () => {
      // Get insurance plans
      const plansResponse = await request(app)
        .get('/api/insurance/plans')
        .expect(200);

      const plans = plansResponse.body.data.plans;

      for (const plan of plans) {
        // Create application and select this plan
        const personalDetails = global.testUtils.createValidPersonalDetails();
        
        const appResponse = await request(app)
          .post('/api/application/personal-details')
          .send(personalDetails)
          .expect(201);

        const appId = appResponse.body.data.applicationId;

        // Select insurance plan
        const insuranceResponse = await request(app)
          .put(`/api/application/${appId}/insurance`)
          .send({ selectedInsurance: plan.id })
          .expect(200);

        // Verify plan details match
        expect(insuranceResponse.body.data.insuranceDetails.planName).toBe(plan.name);
        expect(insuranceResponse.body.data.insuranceDetails.planPrice).toBe(plan.price);
        expect(insuranceResponse.body.data.insuranceDetails.planFeatures).toEqual(plan.features);
      }
    });
  });

  describe('Statistics and Reporting', () => {
    test('should update statistics correctly as applications are processed', async () => {
      // Get initial stats
      const initialStatsResponse = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      const initialStats = initialStatsResponse.body.data;

      // Create and complete multiple applications
      const applicationsToCreate = 3;
      const completedApps = [];

      for (let i = 0; i < applicationsToCreate; i++) {
        // Create application
        const personalDetails = global.testUtils.createValidPersonalDetails();
        personalDetails.name = `Test User ${i + 1}`;
        
        const appResponse = await request(app)
          .post('/api/application/personal-details')
          .send(personalDetails)
          .expect(201);

        const appId = appResponse.body.data.applicationId;

        // Select insurance (vary the plans)
        const planId = (i % 3) + 1;
        await request(app)
          .put(`/api/application/${appId}/insurance`)
          .send({ selectedInsurance: planId })
          .expect(200);

        // Complete payment for first two applications
        if (i < 2) {
          const paymentDetails = global.testUtils.createValidPaymentDetails('upi');
          
          await request(app)
            .put(`/api/application/${appId}/payment`)
            .send(paymentDetails)
            .expect(200);

          await request(app)
            .post(`/api/payment/process/${appId}`)
            .send({ transactionId: `TXN_${i}`, amount: 149 })
            .expect(200);

          completedApps.push(appId);
        }
      }

      // Get updated stats
      const updatedStatsResponse = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      const updatedStats = updatedStatsResponse.body.data;

      // Verify stats are updated correctly
      expect(updatedStats.totalApplications).toBe(initialStats.totalApplications + applicationsToCreate);
      expect(updatedStats.completedApplications).toBe(initialStats.completedApplications + 2);
      expect(updatedStats.pendingApplications).toBe(initialStats.pendingApplications + 1);

      // Verify plan popularity is tracked
      expect(updatedStats.planPopularity.length).toBeGreaterThan(0);
    });
  });
});
