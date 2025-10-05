const User = require('../models/User');
const Application = require('../models/Application');
const InsurancePlan = require('../models/InsurancePlan');
const Payment = require('../models/Payment');
const BillPhoto = require('../models/BillPhoto');
const { isFeatureEnabled } = require('../config/featureFlags');

class ApplicationHandler {
  // Create or update user and create draft application
  async createPersonalDetails(req, res) {
    try {
      const { name, email, phone, dateOfBirth, city } = req.body;

      // Check if email is verified first (MongoDB-based)
      const PreVerification = require('../models/PreVerification');
      const preVerification = await PreVerification.findOne({ email: email.toLowerCase().trim() });
      
      if (!preVerification || !preVerification.verified) {
        return res.status(400).json({
          success: false,
          error: 'Email must be verified before creating application. Please verify your email first.'
        });
      }

      // Check if user already exists with verified email
      let user = await User.findOne({ email });
      
      if (user && user.emailVerified) {
        // User already exists and email is verified - prevent duplicate registration
        return res.status(409).json({
          success: false,
          error: 'This email is already registered and verified. Please use a different email address.',
          code: 'EMAIL_ALREADY_EXISTS'
        });
      }
      
      if (!user) {
        // Create new user with verified email status
        user = new User({
          name,
          email,
          phone,
          dateOfBirth: new Date(dateOfBirth),
          city,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          metadata: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });
        await user.save();
      } else {
        // Update existing unverified user and mark email as verified
        user.name = name;
        user.city = city;
        user.dateOfBirth = new Date(dateOfBirth);
        if (!user.emailVerified) {
          user.emailVerified = true;
          user.emailVerifiedAt = new Date();
        }
        await user.save();
      }

      // Create draft application with application number
      const application = new Application({
        userId: user._id,
        status: 'draft', // Keep as draft but application number will still be generated
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
      await application.save();

      // Clean up the temporary OTP storage after successful application creation
      await PreVerification.deleteOne({ email: email.toLowerCase().trim() });

      res.status(201).json({
        success: true,
        data: {
          applicationId: application._id,
          applicationNumber: application.applicationNumber,
          userId: user._id
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Select insurance plan
  async selectInsurance(req, res) {
    try {
      const { applicationId } = req.params;
      const { selectedInsurance } = req.body;

      // Find the insurance plan by MongoDB _id
      const insurancePlan = await InsurancePlan.findById(selectedInsurance);
      
      if (!insurancePlan) {
        return res.status(404).json({
          success: false,
          error: 'Insurance plan not found'
        });
      }

      // Update application
      const application = await Application.findByIdAndUpdate(
        applicationId,
        { 
          insurancePlanId: insurancePlan._id,
          status: 'submitted'
        },
        { new: true }
      );

      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      res.json({
        success: true,
        data: {
          applicationId: application._id,
          selectedPlan: insurancePlan
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Upload bill photo
  async uploadBillPhoto(req, res) {
    try {
      // Check if bill photo feature is enabled
      if (!isFeatureEnabled('BILL_PHOTO_ENABLED')) {
        return res.status(400).json({
          success: false,
          error: 'Bill photo upload feature is currently disabled'
        });
      }

      const { applicationId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      // Create bill photo record
      const billPhoto = new BillPhoto({
        userId: application.userId,
        applicationId: application._id,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        metadata: {
          uploadSource: 'web'
        }
      });
      await billPhoto.save();

      res.json({
        success: true,
        data: {
          fileId: billPhoto._id,
          filename: billPhoto.filename
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get application details
  async getApplication(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      // Get full details with all related data
      await application.getFullDetails();

      res.json({
        success: true,
        data: application
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Update payment details
  async updatePaymentDetails(req, res) {
    try {
      const { applicationId } = req.params;
      const paymentData = req.body;

      console.log('Payment endpoint - Request data:', JSON.stringify(paymentData, null, 2));

      // Validate payment data using Joi schema
      const { paymentDetailsSchema } = require('../validators/applicationValidator');
      const { error, value } = paymentDetailsSchema.validate(paymentData);
      
      if (error) {
        console.log('Payment validation error:', error.details[0].message);
        return res.status(400).json({
          success: false,
          error: `Payment validation failed: ${error.details[0].message}`
        });
      }

      const application = await Application.findById(applicationId)
        .populate('insurancePlanId');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      // Create payment record using validated data
      const payment = new Payment({
        userId: application.userId,
        applicationId: application._id,
        insurancePlanId: application.insurancePlanId._id,
        amount: application.insurancePlanId.price,
        paymentMethod: value.paymentMethod,
        upiId: value.upiId,
        selectedBank: value.selectedBank,
        accountNumber: value.accountNumber
      });
      await payment.save();

      // Update application status and ensure applicationNumber is generated
      application.status = 'payment_pending';
      if (!application.applicationNumber) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        application.applicationNumber = `VG${timestamp}${random}`.toUpperCase();
      }
      await application.save();

      res.json({
        success: true,
        data: {
          paymentId: payment._id,
          amount: payment.amount
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get insurance plans
  async getInsurancePlans(req, res) {
    try {
      const plans = await InsurancePlan.find({ isActive: true })
        .sort({ sortOrder: 1 });

      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Get application statistics
  async getApplicationStats(req, res) {
    try {
      const stats = await Application.getApplicationStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Submit application (final step)
  async submitApplication(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findById(applicationId);
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      // Check if application can be submitted
      const canSubmit = await application.canSubmit();
      if (!canSubmit) {
        return res.status(400).json({
          success: false,
          error: 'Application cannot be submitted. Please complete all verification steps.'
        });
      }

      // Update application status
      application.status = 'under_review';
      await application.save();

      res.json({
        success: true,
        data: {
          applicationId: application._id,
          applicationNumber: application.applicationNumber,
          status: application.status
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Enroll application without payment (pay later feature)
  async enrollApplication(req, res) {
    try {
      const { applicationId } = req.params;

      const application = await Application.findById(applicationId)
        .populate('insurancePlanId');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      // Check if insurance plan is selected
      if (!application.insurancePlanId) {
        return res.status(400).json({
          success: false,
          error: 'Please select an insurance plan before enrolling'
        });
      }

      // Check basic requirements (verification and bill photo)
      const canSubmit = await application.canSubmit();
      if (!canSubmit) {
        return res.status(400).json({
          success: false,
          error: 'Application cannot be enrolled. Please complete all verification steps.'
        });
      }

      // Update application status to enrolled
      application.status = 'enrolled';
      application.isEnrolled = true;
      await application.save();

      res.json({
        success: true,
        data: {
          applicationId: application._id,
          applicationNumber: application.applicationNumber,
          status: application.status,
          isEnrolled: application.isEnrolled,
          enrolledAt: application.enrolledAt,
          insurancePlan: application.insurancePlanId
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new ApplicationHandler();
