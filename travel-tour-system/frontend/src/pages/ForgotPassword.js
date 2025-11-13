import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiMail, FiArrowLeft } from 'react-icons/fi';
import { forgotPassword } from '../store/slices/authSlice';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await dispatch(forgotPassword(email));
      if (forgotPassword.fulfilled.match(result)) {
        setSubmitted(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(result.payload || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn btn-primary w-full"
              >
                Back to Login
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="btn btn-outline w-full"
              >
                Try Different Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot your password?
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1 relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input pl-10"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full flex justify-center"
            >
              {loading ? (
                <div className="loading-spinner w-5 h-5"></div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="flex items-center justify-center text-primary-600 hover:text-primary-500"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
