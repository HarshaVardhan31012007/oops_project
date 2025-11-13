import React from 'react';
import { FiShield, FiUsers, FiStar, FiHeadphones, FiGlobe, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const WhyChooseUs = () => {
  const features = [
    {
      icon: FiShield,
      title: 'Secure Booking',
      description: 'Your payments and personal information are protected with bank-level security.',
    },
    {
      icon: FiUsers,
      title: 'Expert Guides',
      description: 'Our experienced local guides ensure you get the most out of your journey.',
    },
    {
      icon: FiStar,
      title: 'Top Rated',
      description: 'Join thousands of satisfied travelers who have rated us 4.8/5 stars.',
    },
    {
      icon: FiHeadphones,
      title: '24/7 Support',
      description: 'Round-the-clock customer support to help you before, during, and after your trip.',
    },
    {
      icon: FiGlobe,
      title: 'Global Network',
      description: 'Access to exclusive experiences in over 50 countries worldwide.',
    },
    {
      icon: FiAward,
      title: 'Best Value',
      description: 'Competitive prices with no hidden fees and flexible cancellation policies.',
    },
  ];

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Why Choose TravelTour?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          We're committed to providing exceptional travel experiences with unmatched service and support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="text-center group"
          >
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-600 transition-colors">
              <feature.icon className="w-8 h-8 text-primary-600 group-hover:text-white transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
