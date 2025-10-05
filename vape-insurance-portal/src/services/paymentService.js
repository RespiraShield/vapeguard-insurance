class PaymentService {
  constructor() {
    // Dummy payment service - no initialization needed
  }

  // Simulate payment initialization
  async initiatePayment(orderData, applicationData, onSuccess, _onFailure) {

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Always simulate successful payment for demo purposes
    const dummyPaymentResponse = {
      razorpay_payment_id: `dummy_pay_${Math.random().toString(36).substr(2, 9)}`,
      razorpay_order_id: orderData.id,
      razorpay_signature: `dummy_sig_${Math.random().toString(36).substr(2, 16)}`
    };

    
    // Call success handler with dummy response and include order data
    onSuccess({
      ...dummyPaymentResponse,
      orderData: orderData // Include order data for verification
    });
  }

  // Simulate UPI payment processing
  async processUPIPayment(applicationId, paymentData) {

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return dummy success response
    return {
      success: true,
      message: 'Payment processed successfully',
      transactionId: `dummy_txn_${Math.random().toString(36).substr(2, 12)}`,
      amount: paymentData.amount,
      timestamp: new Date().toISOString()
    };
  }

  // Simulate payment verification
  async verifyPayment(paymentId, orderId, signature, orderData = {}) {

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get the amount from the order data or use a default
    const amount = orderData?.amount || 1000;
    
    // Return successful verification with the actual amount
    return {
      success: true,
      verified: true,
      paymentId,
      orderId,
      status: 'captured',
      amount: amount,
      currency: orderData?.currency || 'INR',
      timestamp: new Date().toISOString()
    };
  }

  // Get supported payment methods
  getSupportedMethods() {
    return {
      upi: {
        name: 'UPI',
        description: 'Pay using any UPI app',
        icon: 'mobile',
        apps: ['PhonePe', 'Google Pay', 'Paytm', 'BHIM', 'Amazon Pay']
      },
      phonepe: {
        name: 'PhonePe',
        description: 'Pay using PhonePe wallet',
        icon: 'phonepe',
        type: 'wallet'
      },
      googlepay: {
        name: 'Google Pay',
        description: 'Pay using Google Pay',
        icon: 'googlepay',
        type: 'wallet'
      },
      paytm: {
        name: 'Paytm',
        description: 'Pay using Paytm wallet',
        icon: 'paytm',
        type: 'wallet'
      }
    };
  }
}

const paymentService = new PaymentService();
export default paymentService;
