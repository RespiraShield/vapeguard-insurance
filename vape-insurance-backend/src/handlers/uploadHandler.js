const fs = require('fs').promises;
const path = require('path');
const Application = require('../models/Application');

/**
 * 📤 Upload Handlers
 * Clean separation of file upload logic from routes
 */

/**
 * Upload bill photo for application
 */
const uploadBillPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const application = await Application.findById(id);
    if (!application) {
      // Clean up uploaded file if application not found
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Delete old file if exists
    if (application.billPhoto && application.billPhoto.filename) {
      const oldFilePath = path.join(process.env.UPLOAD_DIR || 'uploads', application.billPhoto.filename);
      try {
        await fs.unlink(oldFilePath);
      } catch (error) {
        console.error('Error deleting old file:', error);
        // Continue anyway, don't fail the upload
      }
    }

    // Update application with new file info
    application.billPhoto = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date()
    };
    application.updatedAt = new Date();

    await application.save();

    res.json({
      success: true,
      message: 'Bill photo uploaded successfully',
      data: {
        applicationId: application._id,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        uploadedAt: application.billPhoto.uploadedAt
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file on error:', unlinkError);
      }
    }
    next(error);
  }
};

/**
 * Get bill photo information
 */
const getBillPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (!application.billPhoto || !application.billPhoto.filename) {
      return res.status(404).json({
        success: false,
        error: 'No bill photo found for this application'
      });
    }

    // Check if file exists on disk
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', application.billPhoto.filename);
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Bill photo file not found on server'
      });
    }

    res.json({
      success: true,
      data: {
        applicationId: application._id,
        filename: application.billPhoto.filename,
        originalName: application.billPhoto.originalName,
        mimetype: application.billPhoto.mimetype,
        size: application.billPhoto.size,
        uploadedAt: application.billPhoto.uploadedAt,
        url: `/api/upload/bill-photo/${id}/file`
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Serve bill photo file
 */
const serveBillPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (!application.billPhoto || !application.billPhoto.filename) {
      return res.status(404).json({
        success: false,
        error: 'No bill photo found for this application'
      });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', application.billPhoto.filename);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: 'Bill photo file not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', application.billPhoto.mimetype);
    res.setHeader('Content-Disposition', `inline; filename="${application.billPhoto.originalName}"`);
    
    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    next(error);
  }
};

/**
 * Delete bill photo
 */
const deleteBillPhoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    if (!application.billPhoto || !application.billPhoto.filename) {
      return res.status(404).json({
        success: false,
        error: 'No bill photo found for this application'
      });
    }

    // Delete file from disk
    const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', application.billPhoto.filename);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file from disk:', error);
      // Continue anyway to clean up database record
    }

    // Remove file info from application
    application.billPhoto = undefined;
    application.updatedAt = new Date();
    
    await application.save();

    res.json({
      success: true,
      message: 'Bill photo deleted successfully',
      data: {
        applicationId: application._id
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadBillPhoto,
  getBillPhoto,
  serveBillPhoto,
  deleteBillPhoto
};
