const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Stripe Payment Methods
const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      paymentIntent,
      status: paymentIntent.status
    };
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const createRefund = async (paymentIntentId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
      reason
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    return {
      success: true,
      refund
    };
  } catch (error) {
    console.error('Stripe refund creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Razorpay Payment Methods (Alternative)
const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  try {
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      payment_capture: 1
    };

    const order = await razorpay.orders.create(options);

    return {
      success: true,
      order
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const verifyRazorpayPayment = async (orderId, paymentId, signature) => {
  try {
    const crypto = require('crypto');
    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature === signature) {
      return {
        success: true,
        verified: true
      };
    } else {
      return {
        success: false,
        verified: false,
        error: 'Invalid signature'
      };
    }
  } catch (error) {
    console.error('Razorpay payment verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generic payment processing
const processPayment = async (paymentData) => {
  const { method, amount, currency, metadata } = paymentData;

  // Check if payment gateway is configured
  const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                             process.env.STRIPE_SECRET_KEY !== 'sk_test_your_stripe_secret_key';
  const isRazorpayConfigured = process.env.RAZORPAY_KEY_ID && 
                                process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id';

  // Mock payment for development if no gateway is configured
  if (!isStripeConfigured && !isRazorpayConfigured) {
    console.log('⚠️  Payment gateway not configured. Running in mock payment mode.');
    console.log('💳 Mock payment processed for amount:', amount, currency);
    return {
      success: true,
      transactionId: 'mock_' + Date.now(),
      paymentIntentId: 'pi_mock_' + Date.now(),
      status: 'succeeded',
      mock: true
    };
  }

  switch (method.toLowerCase()) {
    case 'stripe':
    case 'credit_card':
    case 'debit_card':
      if (isStripeConfigured) {
        return await createPaymentIntent(amount, currency, metadata);
      } else {
        return {
          success: true,
          transactionId: 'mock_stripe_' + Date.now(),
          paymentIntentId: 'pi_mock_' + Date.now(),
          status: 'succeeded',
          mock: true
        };
      }
    
    case 'razorpay':
      if (isRazorpayConfigured) {
        return await createRazorpayOrder(amount, currency, metadata.receipt);
      } else {
        return {
          success: true,
          transactionId: 'mock_razorpay_' + Date.now(),
          orderId: 'order_mock_' + Date.now(),
          status: 'succeeded',
          mock: true
        };
      }
    
    default:
      // Default to mock payment
      return {
        success: true,
        transactionId: 'mock_default_' + Date.now(),
        paymentIntentId: 'pi_mock_' + Date.now(),
        status: 'succeeded',
        mock: true
      };
  }
};

// Calculate payment fees
const calculatePaymentFees = (amount, method = 'stripe') => {
  let fees = 0;
  
  switch (method.toLowerCase()) {
    case 'stripe':
      // Stripe charges 2.9% + 30¢ for domestic cards
      fees = (amount * 0.029) + 0.30;
      break;
    
    case 'razorpay':
      // Razorpay charges 2% for domestic cards
      fees = amount * 0.02;
      break;
    
    default:
      fees = 0;
  }
  
  return Math.round(fees * 100) / 100; // Round to 2 decimal places
};

// Generate payment receipt
const generatePaymentReceipt = (booking, paymentData) => {
  return {
    receiptNumber: `RCP-${Date.now()}`,
    bookingReference: booking.bookingReference,
    amount: booking.pricing.totalAmount,
    currency: booking.pricing.currency,
    paymentMethod: paymentData.method,
    transactionId: paymentData.transactionId,
    paidAt: new Date(),
    fees: calculatePaymentFees(booking.pricing.totalAmount, paymentData.method)
  };
};

module.exports = {
  // Stripe methods
  createPaymentIntent,
  confirmPaymentIntent,
  createRefund,
  
  // Razorpay methods
  createRazorpayOrder,
  verifyRazorpayPayment,
  
  // Generic methods
  processPayment,
  calculatePaymentFees,
  generatePaymentReceipt
};
