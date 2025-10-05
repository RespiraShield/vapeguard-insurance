const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getCurrentPlan,
  getUserApplications,
  getPaymentHistory,
  getMonthlyPayments,
  getVerificationStatus,
  getMaskedPII
} = require('../handlers/dashboardHandler');
const { authenticateToken, requireEmailVerified } = require('../middleware/auth');

// Apply authentication middleware to all dashboard routes
router.use(authenticateToken);
router.use(requireEmailVerified);

// @desc    Get complete dashboard data for user
// @route   GET /api/dashboard
// @access  Private
router.get('/', getDashboardData);

// @desc    Get user's current insurance plan
// @route   GET /api/dashboard/current-plan
// @access  Private
router.get('/current-plan', getCurrentPlan);

// @desc    Get user's applications
// @route   GET /api/dashboard/applications
// @access  Private
router.get('/applications', getUserApplications);

// @desc    Get user's payment history
// @route   GET /api/dashboard/payments
// @access  Private
router.get('/payments', getPaymentHistory);

// @desc    Get monthly payment aggregation
// @route   GET /api/dashboard/monthly-payments
// @access  Private
router.get('/monthly-payments', getMonthlyPayments);

// @desc    Get verification status for user
// @route   GET /api/dashboard/verification-status
// @access  Private
router.get('/verification-status', getVerificationStatus);

// @desc    Get masked PII data for user
// @route   GET /api/dashboard/masked-pii
// @access  Private
router.get('/masked-pii', getMaskedPII);

module.exports = router;
