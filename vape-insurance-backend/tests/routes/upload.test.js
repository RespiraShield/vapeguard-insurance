const request = require('supertest');
const express = require('express');
const path = require('path');
const fs = require('fs');
const uploadRoutes = require('../../src/routes/upload');
const Application = require('../../src/models/Application');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/upload', uploadRoutes);

describe('Upload Routes', () => {
  let applicationId;
  const testImagePath = path.join(__dirname, '../fixtures/test-image.jpg');

  beforeAll(() => {
    // Create a test image file
    const testImageBuffer = Buffer.from('fake-image-data');
    fs.writeFileSync(testImagePath, testImageBuffer);
  });

  afterAll(() => {
    // Clean up test image
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  });

  beforeEach(async () => {
    // Create a test application
    const application = new Application({
      personalDetails: global.testUtils.createValidPersonalDetails()
    });
    const savedApplication = await application.save();
    applicationId = savedApplication._id;
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

  describe('POST /api/upload/bill-photo/:applicationId', () => {
    test('should upload bill photo successfully', async () => {
      const response = await request(app)
        .post(`/api/upload/bill-photo/${applicationId}`)
        .attach('billPhoto', testImagePath)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bill photo uploaded successfully');
      expect(response.body.data.billPhoto.filename).toBeDefined();
      expect(response.body.data.billPhoto.originalName).toBe('test-image.jpg');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.billPhoto).toBeDefined();
      expect(application.billPhoto.filename).toBeDefined();
      expect(application.billPhoto.originalName).toBe('test-image.jpg');
    });

    test('should reject upload without file', async () => {
      const response = await request(app)
        .post(`/api/upload/bill-photo/${applicationId}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Bill photo is required');
    });

    test('should reject upload for non-existent application', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .post(`/api/upload/bill-photo/${nonExistentId}`)
        .attach('billPhoto', testImagePath)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Application not found');
    });

    test('should handle file upload errors gracefully', async () => {
      // Create a test file that's too large (mock)
      const largeMockFile = Buffer.alloc(15 * 1024 * 1024); // 15MB
      const largeFilePath = path.join(__dirname, '../fixtures/large-file.jpg');
      fs.writeFileSync(largeFilePath, largeMockFile);

      try {
        const response = await request(app)
          .post(`/api/upload/bill-photo/${applicationId}`)
          .attach('billPhoto', largeFilePath)
          .expect(400);

        expect(response.body.success).toBe(false);
      } finally {
        // Clean up
        if (fs.existsSync(largeFilePath)) {
          fs.unlinkSync(largeFilePath);
        }
      }
    });
  });

  describe('GET /api/upload/bill-photo/:applicationId', () => {
    beforeEach(async () => {
      // Upload a file first
      await request(app)
        .post(`/api/upload/bill-photo/${applicationId}`)
        .attach('billPhoto', testImagePath);
    });

    test('should get bill photo info', async () => {
      const response = await request(app)
        .get(`/api/upload/bill-photo/${applicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.billPhoto.filename).toBeDefined();
      expect(response.body.data.billPhoto.originalName).toBe('test-image.jpg');
      expect(response.body.data.billPhoto.url).toContain('/uploads/bills/');
    });

    test('should return 404 when no bill photo exists', async () => {
      // Create new application without bill photo
      const newApplication = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails()
      });
      await newApplication.save();

      const response = await request(app)
        .get(`/api/upload/bill-photo/${newApplication._id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Bill photo not found');
    });
  });

  describe('DELETE /api/upload/bill-photo/:applicationId', () => {
    beforeEach(async () => {
      // Upload a file first
      await request(app)
        .post(`/api/upload/bill-photo/${applicationId}`)
        .attach('billPhoto', testImagePath);
    });

    test('should delete bill photo successfully', async () => {
      const response = await request(app)
        .delete(`/api/upload/bill-photo/${applicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bill photo deleted successfully');

      // Verify in database
      const application = await Application.findById(applicationId);
      expect(application.billPhoto).toBeUndefined();
    });

    test('should return 404 when no bill photo to delete', async () => {
      // Create new application without bill photo
      const newApplication = new Application({
        personalDetails: global.testUtils.createValidPersonalDetails()
      });
      await newApplication.save();

      const response = await request(app)
        .delete(`/api/upload/bill-photo/${newApplication._id}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('No bill photo to delete');
    });

    test('should handle file system errors gracefully', async () => {
      // Get the application with bill photo
      const application = await Application.findById(applicationId);
      
      // Manually delete the file from filesystem but keep DB record
      const filePath = path.join(process.cwd(), application.billPhoto.path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      const response = await request(app)
        .delete(`/api/upload/bill-photo/${applicationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Bill photo deleted successfully');
    });
  });
});
