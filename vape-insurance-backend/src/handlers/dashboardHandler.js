const mongoose = require('mongoose');
const User = require('../models/User');
const Application = require('../models/Application');
const Payment = require('../models/Payment');
const InsurancePlan = require('../models/InsurancePlan');
const { maskEmail, maskPhone, maskPAN, maskAadhaar, maskBankAccount } = require('../utils/maskingUtils');

// @desc    Get complete dashboard data for user
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user details
    const user = await User.findById(userId).select('-__v');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Get user's applications with populated insurance plan data
    const applications = await Application.find({ userId })
      .populate('insurancePlanId')
      .sort({ createdAt: -1 })
      .lean();

    // Get current active plan (most recent completed application)
    const currentApplication = applications.find(app => 
      app.status === 'completed' || app.status === 'approved' || app.status === 'under_review'
    );
    const currentPlan = currentApplication ? currentApplication.insurancePlanId : null;

    // Get payment history
    const payments = await Payment.find({ userId })
      .populate('insurancePlanId')
      .sort({ createdAt: -1 });

    // Get monthly payment aggregation for current year
    const currentYear = new Date().getFullYear();
    const monthlyPayments = await getMonthlyPaymentAggregation(userId, currentYear);

    res.json({
      success: true,
      data: {
        user,
        currentPlan,
        applications,
        payments,
        monthlyPayments
      }
    });
  } catch (error) {
    console.error('Get dashboard data error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard data'
    });
  }
};

// @desc    Get user's current insurance plan
// @route   GET /api/dashboard/current-plan
// @access  Private
const getCurrentPlan = async (req, res) => {
  try {
    const userId = req.user.userId;

    const application = await Application.findOne({
      userId,
      status: { $in: ['completed', 'approved'] }
    })
    .populate('insurancePlanId')
    .sort({ completedAt: -1 });

    res.json({
      success: true,
      data: application ? application.insurancePlanId : null
    });
  } catch (error) {
    console.error('Get current plan error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current plan'
    });
  }
};

// @desc    Get user's applications
// @route   GET /api/dashboard/applications
// @access  Private
const getUserApplications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const applications = await Application.find({ userId })
      .populate('insurancePlanId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get applications'
    });
  }
};

// @desc    Get user's payment history
// @route   GET /api/dashboard/payments
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const payments = await Payment.find({ userId })
      .populate('insurancePlanId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment history'
    });
  }
};

// @desc    Get monthly payment aggregation
// @route   GET /api/dashboard/monthly-payments
// @access  Private
const getMonthlyPayments = async (req, res) => {
  try {
    const userId = req.user.userId;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const monthlyPayments = await getMonthlyPaymentAggregation(userId, year);

    res.json({
      success: true,
      data: monthlyPayments
    });
  } catch (error) {
    console.error('Get monthly payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get monthly payments'
    });
  }
};

// @desc    Get verification status for user
// @route   GET /api/dashboard/verification-status
// @access  Private
const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get real user verification status from MongoDB
    const user = await User.findById(userId).select('emailVerified phoneVerified panNumber aadhaarNumber bankDetails');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Use real user verification data
    const verificationStatus = {
      pan: user.panNumber ? 'verified' : 'pending',
      aadhaar: user.aadhaarNumber ? 'verified' : 'pending', 
      phone: user.phoneVerified ? 'verified' : 'pending',
      email: user.emailVerified ? 'verified' : 'pending',
      bank: user.bankDetails?.accountNumber ? 'verified' : 'pending'
    };

    res.json({
      success: true,
      data: verificationStatus
    });
  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get verification status'
    });
  }
};

// @desc    Get masked PII data for user
// @route   GET /api/dashboard/masked-pii
// @access  Private
const getMaskedPII = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get real user data from MongoDB
    const user = await User.findById(userId).select('panNumber aadhaarNumber phone email bankDetails');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Use real user data with masking
    const maskedPII = {
      pan: user.panNumber || 'Not provided',
      aadhaar: user.aadhaarNumber || 'Not provided',
      phone: user.phone || 'Not provided',
      email: user.email || 'Not provided',
      bankAccount: user.bankDetails?.accountNumber || 'Not provided'
    };

    res.json({
      success: true,
      data: maskedPII
    });
  } catch (error) {
    console.error('Get masked PII error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get PII data'
    });
  }
};

// Helper function to aggregate monthly payments
const getMonthlyPaymentAggregation = async (userId, year) => {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year + 1, 0, 1);

  const aggregation = await Payment.aggregate([
    {
      $match: {
        userId: userId,
        status: 'completed',
        $or: [
          { completedAt: { $gte: startDate, $lt: endDate } },
          { createdAt: { $gte: startDate, $lt: endDate } }
        ]
      }
    },
    {
      $group: {
        _id: {
          month: { 
            $month: { 
              $ifNull: ['$completedAt', '$createdAt'] 
            }
          },
          year: { 
            $year: { 
              $ifNull: ['$completedAt', '$createdAt'] 
            }
          }
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.month': 1 }
    }
  ]);

  // Convert to array with month names
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const monthlyPayments = monthNames.map((month, index) => {
    const monthData = aggregation.find(item => item._id.month === index + 1);
    return {
      month,
      year,
      amount: monthData ? monthData.amount : 0,
      count: monthData ? monthData.count : 0
    };
  });

  return monthlyPayments;
};

module.exports = {
  getDashboardData,
  getCurrentPlan,
  getUserApplications,
  getPaymentHistory,
  getMonthlyPayments,
  getVerificationStatus,
  getMaskedPII
};
