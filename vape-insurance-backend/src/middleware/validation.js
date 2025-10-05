const validate = (schema) => {
  return (req, res, next) => {
    // Special handling for payment validation
    const validationOptions = {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    };
    
    // For payment validation, we want to be more lenient with unknown fields
    if (req.path.includes('/payment')) {
      validationOptions.allowUnknown = true;
      validationOptions.abortEarly = true;
    }
    
    const { error } = schema.validate(req.body, validationOptions);

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errorMessages
      });
    }

    next();
  };
};

const validateFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Bill photo is required'
    });
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      error: 'Only JPEG, PNG, and GIF images are allowed'
    });
  }

  // Check file size (10MB max)
  if (req.file.size > 10 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      error: 'File size cannot exceed 10MB'
    });
  }

  next();
};

module.exports = { validate, validateFile };
