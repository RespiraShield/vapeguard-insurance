const Application = require('../models/Application');
const Payment = require('../models/Payment');
const InsurancePlan = require('../models/InsurancePlan');
const Razorpay = require('razorpay');

class PaymentHandler {
  constructor() {
    // Initialize Razorpay only if credentials are available
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      this.razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
    } else {
      console.warn('Razorpay credentials not found. Payment functionality will be limited.');
      this.razorpay = null;
    }
  }

  // Create payment order
  async createPaymentOrder(req, res) {
    try {
      const { applicationId } = req.params;

      // Check if Razorpay is configured
      if (!this.razorpay) {
        return res.status(400).json({
          success: false,
          error: 'Payment gateway not configured. Please contact administrator.'
        });
      }

      const application = await Application.findById(applicationId)
        .populate('userId')
        .populate('insurancePlanId');
      
      if (!application) {
        return res.status(404).json({
          success: false,
          error: 'Application not found'
        });
      }

      if (!application.insurancePlanId) {
        return res.status(400).json({
          success: false,
          error: 'Insurance plan not selected'
        });
      }

      // Check if payment already exists
      let payment = await Payment.findOne({ applicationId });
      if (!payment) {
        payment = new Payment({
          userId: application.userId._id,
          applicationId: application._id,
          insurancePlanId: application.insurancePlanId._id,
          amount: application.insurancePlanId.price.amount,
          paymentMethod: 'upi' // Default, will be updated
        });
      }

      // Create Razorpay order
      const orderOptions = {
        amount: payment.amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${application.applicationNumber || 'temp'}`,
        notes: {
          applicationId: application._id.toString(),
          userId: application.userId._id.toString(),
          planName: application.insurancePlanId.name
        }
      };

      const razorpayOrder = await this.razorpay.orders.create(orderOptions);
      
      payment.razorpayOrderId = razorpayOrder.id;
      payment.status = 'processing';
      await payment.save();

      res.json({
        success: true,
        data: {
          orderId: razorpayOrder.id,
          amount: payment.amount,
          currency: 'INR',
          applicationNumber: application.applicationNumber,
          userDetails: {
            name: application.userId.name,
            email: application.userId.email,
            phone: application.userId.phone
          }
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Process payment (for non-Razorpay methods)
  async processPayment(req, res) {
    try {
      const { applicationId, transactionId, paymentMethod, bankReference } = req.body;

      const payment = await Payment.findOne({ applicationId });
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment record not found'
        });
      }

      // Update payment details
      payment.transactionId = transactionId;
      payment.paymentMethod = paymentMethod;
      payment.status = 'completed';
      payment.gatewayResponse = { bankReference };
      await payment.save();

      // Update application status
      const application = await Application.findById(applicationId);
      application.status = 'completed';
      await application.save();

      res.json({
        success: true,
        data: {
          transactionId: payment.transactionId,
          status: payment.status
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Verify Razorpay payment
  async verifyPayment(req, res) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_data } = req.body;

      // For dummy payments, find payment by applicationId from order_data
      let payment;
      if (order_data && order_data.id && order_data.id.startsWith('dummy_order_')) {
        // This is a dummy payment, find by any available payment record
        payment = await Payment.findOne({ status: { $in: ['pending', 'created'] } }).sort({ createdAt: -1 });
      } else {
        // Real Razorpay payment
        payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      }

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment record not found'
        });
      }

      // Skip signature verification for dummy payments
      if (!order_data || !order_data.id || !order_data.id.startsWith('dummy_order_')) {
        // Verify signature for real payments
        const crypto = require('crypto');
        const expectedSignature = crypto
          .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex');

        if (expectedSignature !== razorpay_signature) {
          payment.status = 'failed';
          payment.failureReason = 'Invalid signature';
          await payment.save();

          return res.status(400).json({
            success: false,
            error: 'Payment verification failed'
          });
        }
      }

      // Update payment as completed
      payment.razorpayPaymentId = razorpay_payment_id;
      payment.razorpaySignature = razorpay_signature;
      payment.status = 'completed';
      payment.gatewayResponse = { razorpay_order_id, razorpay_payment_id };
      await payment.save();

      // Update application status
      const application = await Application.findById(payment.applicationId);
      application.status = 'completed';
      await application.save();

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          paymentId: payment._id,
          transactionId: payment.transactionId,
          status: payment.status,
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

  // Get payment status
  async getPaymentStatus(req, res) {
    try {
      const { applicationId } = req.params;

      const payment = await Payment.findOne({ applicationId })
        .populate('insurancePlanId', 'name price');

      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment record not found'
        });
      }

      res.json({
        success: true,
        data: {
          paymentId: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          razorpayOrderId: payment.razorpayOrderId,
          createdAt: payment.createdAt,
          completedAt: payment.completedAt,
          insurancePlan: payment.insurancePlanId
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }

  // Initiate refund
  async initiateRefund(req, res) {
    try {
      const { paymentId } = req.params;
      const { amount, reason } = req.body;

      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: 'Payment not found'
        });
      }

      if (payment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Only completed payments can be refunded'
        });
      }

      // Initiate refund with Razorpay if applicable
      if (payment.razorpayPaymentId) {
        const refundAmount = amount || payment.amount;
        const refund = await this.razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: refundAmount * 100, // Convert to paise
          notes: { reason }
        });

        payment.refund = {
          refundId: refund.id,
          refundAmount: refundAmount,
          refundReason: reason,
          refundStatus: 'processed',
          refundedAt: new Date()
        };
      } else {
        // For non-Razorpay payments, mark as pending manual refund
        payment.refund = {
          refundAmount: amount || payment.amount,
          refundReason: reason,
          refundStatus: 'pending'
        };
      }

      payment.status = 'refunded';
      await payment.save();

      res.json({
        success: true,
        message: 'Refund initiated successfully',
        data: payment.refund
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new PaymentHandler();
