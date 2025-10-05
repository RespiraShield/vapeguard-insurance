const { validate, validateFile } = require('../../src/middleware/validation');
const { personalDetailsSchema } = require('../../src/validators/applicationValidator');

describe('Validation Middleware', () => {
  describe('validate middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = { body: {} };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should call next() with valid data', () => {
      req.body = global.testUtils.createValidPersonalDetails();
      const middleware = validate(personalDetailsSchema);
      
      middleware(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 with validation errors', () => {
      req.body = {
        name: 'J', // Too short
        dob: '1990-01-01',
        city: 'mumbai'
      };
      const middleware = validate(personalDetailsSchema);
      
      middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.any(Array)
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should strip unknown fields', () => {
      req.body = {
        ...global.testUtils.createValidPersonalDetails(),
        unknownField: 'should be removed'
      };
      const middleware = validate(personalDetailsSchema);
      
      middleware(req, res, next);
      
      expect(req.body.unknownField).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    test('should provide detailed error information', () => {
      req.body = {
        name: '', // Empty name
        dob: 'invalid-date',
        city: ''
      };
      const middleware = validate(personalDetailsSchema);
      
      middleware(req, res, next);
      
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: expect.any(String),
            message: expect.any(String)
          })
        ])
      });
    });
  });

  describe('validateFile middleware', () => {
    let req, res, next;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should call next() with valid file', () => {
      req.file = global.testUtils.createMockFile();
      
      validateFile(req, res, next);
      
      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when no file provided', () => {
      validateFile(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Bill photo is required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('should reject invalid file types', () => {
      req.file = {
        ...global.testUtils.createMockFile(),
        mimetype: 'application/pdf'
      };
      
      validateFile(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Only JPEG, PNG, and GIF images are allowed'
      });
    });

    test('should reject files that are too large', () => {
      req.file = {
        ...global.testUtils.createMockFile(),
        size: 15 * 1024 * 1024 // 15MB
      };
      
      validateFile(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'File size cannot exceed 10MB'
      });
    });

    test('should accept all valid image types', () => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      
      validTypes.forEach(mimetype => {
        req.file = {
          ...global.testUtils.createMockFile(),
          mimetype
        };
        
        next.mockClear();
        res.status.mockClear();
        
        validateFile(req, res, next);
        
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
      });
    });
  });
});
