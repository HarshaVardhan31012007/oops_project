import React, { useState } from 'react';
import { FiCreditCard, FiLock, FiCheck } from 'react-icons/fi';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const publishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

const PaymentForm = ({ amount, currency = 'usd', onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would:
      // 1. Create payment intent on your backend
      // 2. Confirm payment with Stripe
      // 3. Handle success/error responses
      
      onSuccess({
        paymentIntentId: 'pi_test_' + Date.now(),
        amount,
        currency,
        status: 'succeeded'
      });
    } catch (error) {
      onError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <FiLock className="w-5 h-5 text-green-500 mr-2" />
          <span className="text-sm text-gray-600">Secure payment powered by Stripe</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3"
                />
                <FiCreditCard className="w-5 h-5 mr-2 text-gray-400" />
                <span>Credit/Debit Card</span>
              </label>
            </div>
          </div>

          {/* Card Element */}
          {paymentMethod === 'card' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Details
              </label>
              <div className="p-3 border rounded-lg">
                <div className="bg-gray-100 p-4 rounded text-center text-gray-500">
                  <FiCreditCard className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Card payment integration</p>
                  <p className="text-xs">In production, this would show Stripe's CardElement</p>
                </div>
              </div>
            </div>
          )}

          {/* Amount Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm">${(amount * 0.9).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Taxes</span>
              <span className="text-sm">${(amount * 0.1).toFixed(2)}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="font-semibold text-lg">${amount.toFixed(2)} {currency.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg w-full flex items-center justify-center"
          >
            {loading ? (
              <div className="loading-spinner w-5 h-5"></div>
            ) : (
              <>
                <FiCheck className="w-5 h-5 mr-2" />
                Pay ${amount.toFixed(2)} {currency.toUpperCase()}
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            Your payment information is secure and encrypted.
          </p>
        </form>
      </div>
    </div>
  );
};

const PaymentFormWrapper = (props) => {
  if (!stripePromise) {
    return (
      <>
        <div className="mb-4 text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-2">
          Stripe publishable key not configured. Running in mock payment mode.
        </div>
        <PaymentForm {...props} />
      </>
    );
  }
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentFormWrapper;
