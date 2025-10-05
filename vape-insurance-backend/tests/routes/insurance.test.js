const request = require('supertest');
const express = require('express');
const insuranceRoutes = require('../../src/routes/insurance');
const Application = require('../../src/models/Application');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/insurance', insuranceRoutes);

describe('Insurance Routes', () => {
  describe('GET /api/insurance/plans', () => {
    test('should get all insurance plans', async () => {
      const response = await request(app)
        .get('/api/insurance/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Insurance plans retrieved successfully');
      expect(response.body.data.plans).toHaveLength(3);
      expect(response.body.data.totalPlans).toBe(3);

      // Verify plan structure
      const plans = response.body.data.plans;
      expect(plans[0]).toHaveProperty('id', 1);
      expect(plans[0]).toHaveProperty('name', 'Basic Respiratory Care');
      expect(plans[0]).toHaveProperty('price', '₹149/purchase');
      expect(plans[0]).toHaveProperty('features');
      expect(Array.isArray(plans[0].features)).toBe(true);

      expect(plans[1]).toHaveProperty('id', 2);
      expect(plans[1]).toHaveProperty('name', 'Premium Lung Shield');
      expect(plans[1]).toHaveProperty('price', '₹299/purchase');

      expect(plans[2]).toHaveProperty('id', 3);
      expect(plans[2]).toHaveProperty('name', 'Complete Wellness Pro');
      expect(plans[2]).toHaveProperty('price', '₹499/purchase');
    });

    test('should return consistent plan data', async () => {
      const response = await request(app)
        .get('/api/insurance/plans')
        .expect(200);

      const plans = response.body.data.plans;
      
      // Verify all plans have required fields
      plans.forEach(plan => {
        expect(plan).toHaveProperty('id');
        expect(plan).toHaveProperty('name');
        expect(plan).toHaveProperty('price');
        expect(plan).toHaveProperty('features');
        expect(typeof plan.id).toBe('number');
        expect(typeof plan.name).toBe('string');
        expect(typeof plan.price).toBe('string');
        expect(Array.isArray(plan.features)).toBe(true);
        expect(plan.features.length).toBeGreaterThan(0);
      });
    });
  });

  describe('GET /api/insurance/plans/:id', () => {
    test('should get specific insurance plan by ID', async () => {
      const response = await request(app)
        .get('/api/insurance/plans/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Insurance plan retrieved successfully');
      expect(response.body.data.plan.id).toBe(1);
      expect(response.body.data.plan.name).toBe('Basic Respiratory Care');
      expect(response.body.data.plan.price).toBe('₹149/purchase');
    });

    test('should get all valid plan IDs', async () => {
      const validPlanIds = [1, 2, 3];
      
      for (const planId of validPlanIds) {
        const response = await request(app)
          .get(`/api/insurance/plans/${planId}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.plan.id).toBe(planId);
      }
    });

    test('should return 404 for invalid plan ID', async () => {
      const response = await request(app)
        .get('/api/insurance/plans/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insurance plan not found');
    });

    test('should return 404 for non-numeric plan ID', async () => {
      const response = await request(app)
        .get('/api/insurance/plans/invalid')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Insurance plan not found');
    });
  });

  describe('GET /api/insurance/stats', () => {
    beforeEach(async () => {
      // Create test applications with different statuses and plans
      const applications = [
        {
          personalDetails: global.testUtils.createValidPersonalDetails(),
          insuranceDetails: { selectedPlan: 1, planName: 'Basic Respiratory Care' },
          status: 'completed'
        },
        {
          personalDetails: global.testUtils.createValidPersonalDetails(),
          insuranceDetails: { selectedPlan: 1, planName: 'Basic Respiratory Care' },
          status: 'completed'
        },
        {
          personalDetails: global.testUtils.createValidPersonalDetails(),
          insuranceDetails: { selectedPlan: 2, planName: 'Premium Lung Shield' },
          status: 'completed'
        },
        {
          personalDetails: global.testUtils.createValidPersonalDetails(),
          insuranceDetails: { selectedPlan: 3, planName: 'Complete Wellness Pro' },
          status: 'submitted'
        },
        {
          personalDetails: global.testUtils.createValidPersonalDetails(),
          status: 'draft'
        }
      ];

      await Application.insertMany(applications);
    });

    test('should get insurance statistics', async () => {
      const response = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Insurance statistics retrieved successfully');
      
      const stats = response.body.data;
      expect(stats.totalApplications).toBe(5);
      expect(stats.completedApplications).toBe(3);
      expect(stats.pendingApplications).toBe(2);
      expect(parseFloat(stats.completionRate)).toBe(60.00);
      expect(Array.isArray(stats.planPopularity)).toBe(true);
    });

    test('should calculate completion rate correctly', async () => {
      const response = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      const stats = response.body.data;
      const expectedRate = (stats.completedApplications / stats.totalApplications) * 100;
      expect(parseFloat(stats.completionRate)).toBe(parseFloat(expectedRate.toFixed(2)));
    });

    test('should show plan popularity in correct order', async () => {
      const response = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      const planStats = response.body.data.planPopularity;
      expect(planStats).toHaveLength(3);
      
      // Should be sorted by count (descending)
      expect(planStats[0]._id).toBe(1); // Basic plan with 2 applications
      expect(planStats[0].count).toBe(2);
      expect(planStats[0].planName).toBe('Basic Respiratory Care');
      
      expect(planStats[1]._id).toBe(2); // Premium plan with 1 application
      expect(planStats[1].count).toBe(1);
      
      expect(planStats[2]._id).toBe(3); // Complete plan with 1 application
      expect(planStats[2].count).toBe(1);
    });

    test('should handle empty database', async () => {
      // Clear all applications
      await Application.deleteMany({});

      const response = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      const stats = response.body.data;
      expect(stats.totalApplications).toBe(0);
      expect(stats.completedApplications).toBe(0);
      expect(stats.pendingApplications).toBe(0);
      expect(stats.completionRate).toBe('0');
      expect(stats.planPopularity).toHaveLength(0);
    });

    test('should handle applications without insurance details', async () => {
      // Clear all applications and add one without insurance details
      await Application.deleteMany({});
      
      const application = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails(),
        status: 'draft'
      });
      await application.save();

      const response = await request(app)
        .get('/api/insurance/stats')
        .expect(200);

      const stats = response.body.data;
      expect(stats.totalApplications).toBe(1);
      expect(stats.completedApplications).toBe(0);
      expect(stats.pendingApplications).toBe(1);
      expect(stats.planPopularity).toHaveLength(0);
    });
  });
});
