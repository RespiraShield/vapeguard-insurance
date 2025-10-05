const errorHandler = require('../../src/middleware/errorHandler');

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  test('should handle generic errors', () => {
    const error = new Error('Generic error message');
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Generic error message'
    });
  });

  test('should handle Mongoose CastError', () => {
    const error = {
      name: 'CastError',
      message: 'Cast to ObjectId failed'
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Resource not found'
    });
  });

  test('should handle Mongoose duplicate key error', () => {
    const error = {
      code: 11000,
      message: 'Duplicate key error'
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Duplicate field value entered'
    });
  });

  test('should handle Mongoose validation error', () => {
    const error = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required' },
        email: { message: 'Email is invalid' }
      }
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Name is required, Email is invalid'
    });
  });

  test('should handle JWT errors', () => {
    const jwtError = {
      name: 'JsonWebTokenError',
      message: 'Invalid token'
    };
    
    errorHandler(jwtError, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Invalid token'
    });

    const expiredError = {
      name: 'TokenExpiredError',
      message: 'Token expired'
    };
    
    res.status.mockClear();
    res.json.mockClear();
    
    errorHandler(expiredError, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Token expired'
    });
  });

  test('should handle Multer file size error', () => {
    const error = {
      code: 'LIMIT_FILE_SIZE',
      message: 'File too large'
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'File too large. Maximum size is 10MB'
    });
  });

  test('should handle Multer unexpected file error', () => {
    const error = {
      code: 'LIMIT_UNEXPECTED_FILE',
      message: 'Unexpected file'
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Unexpected file field'
    });
  });

  test('should handle Joi validation errors', () => {
    const error = {
      isJoi: true,
      details: [
        { message: 'Name is required' },
        { message: 'Email is invalid' }
      ]
    };
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Name is required, Email is invalid'
    });
  });

  test('should include stack trace in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const error = new Error('Test error');
    error.stack = 'Error stack trace';
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error',
      stack: 'Error stack trace'
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  test('should not include stack trace in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    
    const error = new Error('Test error');
    error.stack = 'Error stack trace';
    
    errorHandler(error, req, res, next);
    
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Test error'
    });
    
    process.env.NODE_ENV = originalEnv;
  });

  test('should handle errors with custom status codes', () => {
    const error = new Error('Custom error');
    error.statusCode = 422;
    
    errorHandler(error, req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: 'Custom error'
    });
  });

  test('should log errors to console', () => {
    const error = new Error('Test error for logging');
    
    errorHandler(error, req, res, next);
    
    expect(console.error).toHaveBeenCalledWith('❌ Error:', error);
  });
});
