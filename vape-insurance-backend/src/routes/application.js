const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Import handlers
const applicationHandler = require('../handlers/applicationHandler');
const paymentHandler = require('../handlers/paymentHandler');
const preVerificationHandler = require('../handlers/preVerificationHandler');
const verificationHandler = require('../handlers/verificationHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/bills/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'bill-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Pre-Registration Email Verification (MongoDB-based, no mocking)
router.post('/otp/email/send', preVerificationHandler.sendEmailOTP);
router.post('/otp/email/verify', preVerificationHandler.verifyEmailOTP);
router.post('/otp/email/check-verified', preVerificationHandler.checkEmailVerified);
router.post('/application/check-email', preVerificationHandler.checkEmailExists);

// Application Routes
router.post('/application/personal-details', applicationHandler.createPersonalDetails);
router.put('/application/:applicationId/insurance', applicationHandler.selectInsurance);
router.post('/application/:applicationId/upload-bill', upload.single('billPhoto'), applicationHandler.uploadBillPhoto);
router.get('/application/:applicationId', applicationHandler.getApplication);
router.put('/application/:applicationId/payment', applicationHandler.updatePaymentDetails);
router.post('/application/:applicationId/submit', applicationHandler.submitApplication);
router.post('/application/:applicationId/enroll', applicationHandler.enrollApplication);

// Insurance Routes
router.get('/insurance/plans', applicationHandler.getInsurancePlans);
router.get('/insurance/stats', applicationHandler.getApplicationStats);

// Verification Status Route (for frontend compatibility)
router.get('/verification/status/:applicationId', verificationHandler.getVerificationStatus);

// Payment Routes
router.post('/payment/create-order/:applicationId', paymentHandler.createPaymentOrder);
router.post('/payment/process', paymentHandler.processPayment);
router.post('/payment/verify', paymentHandler.verifyPayment);
router.get('/payment/status/:applicationId', paymentHandler.getPaymentStatus);
router.post('/payment/refund/:paymentId', paymentHandler.initiateRefund);

module.exports = router;
