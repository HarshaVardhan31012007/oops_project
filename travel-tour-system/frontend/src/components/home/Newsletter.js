import React, { useState } from 'react';
import { FiMail, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to our newsletter!');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-white mb-4">
        Stay Updated with Our Latest Offers
      </h2>
      <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
        Subscribe to our newsletter and be the first to know about new destinations, special offers, and exclusive deals.
      </p>
      
      <form onSubmit={handleSubmit} className="max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg flex items-center justify-center whitespace-nowrap"
          >
            {loading ? (
              <div className="loading-spinner w-5 h-5"></div>
            ) : (
              <>
                <FiSend className="w-5 h-5 mr-2" />
                Subscribe
              </>
            )}
          </button>
        </div>
      </form>
      
      <p className="text-sm text-gray-400 mt-4">
        We respect your privacy. Unsubscribe at any time.
      </p>
    </div>
  );
};

export default Newsletter;
