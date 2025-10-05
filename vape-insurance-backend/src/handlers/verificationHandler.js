const Application = require('../models/Application');
const User = require('../models/User');
const PreVerification = require('../models/PreVerification');

/**
 * VerificationHandler
 * 
 * Provides verification status for frontend compatibility.
 * Queries actual verification data from database instead of hardcoding values.
 */
class VerificationHandler {
  /**
   * Get verification status for an application
   * @route GET /api/verification/status/:applicationId
   */
  async getVerificationStatus(req, res) {
    try {
      const { applicationId } = req.params;
      
      const application = await Application.findById(applicationId).populate('userId');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      const user = application.userId;
      
      // Check if email was verified via PreVerification
      const preVerification = await PreVerification.findOne({ 
        email: user.email.toLowerCase().trim() 
      });

      // Determine email verification status from actual data
      const emailVerified = preVerification?.verified || user.emailVerified || false;
      const emailVerifiedAt = preVerification?.verifiedAt || user.emailVerifiedAt || null;

      // Check phone verification status from user model
      const phoneVerified = user.phoneVerified || false;
      const phoneVerifiedAt = user.phoneVerifiedAt || null;

      // Determine if verification is complete
      const isComplete = emailVerified;

      res.json({
        success: true,
        data: {
          email: {
            verified: emailVerified,
            attempts: preVerification?.attempts || 0,
            verifiedAt: emailVerifiedAt
          },
          phone: {
            verified: phoneVerified,
            attempts: 0,
            verifiedAt: phoneVerifiedAt
          },
          isComplete: isComplete,
          completedAt: isComplete ? (emailVerifiedAt || application.createdAt) : null
        }
      });
    } catch (error) {
      console.error('Error getting verification status:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new VerificationHandler();
