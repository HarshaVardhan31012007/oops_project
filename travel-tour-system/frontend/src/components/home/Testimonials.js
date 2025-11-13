import React from 'react';
import { FiStar, FiMessageSquare } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, USA',
      rating: 5,
      text: 'Amazing experience! The tour was well-organized and our guide was fantastic. Highly recommended!',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Michael Chen',
      location: 'Toronto, Canada',
      rating: 5,
      text: 'Best travel experience I\'ve ever had. The itinerary was perfect and everything went smoothly.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Emma Wilson',
      location: 'London, UK',
      rating: 5,
      text: 'Outstanding service from start to finish. The team made our dream vacation come true!',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {testimonials.map((testimonial, index) => (
        <motion.div
          key={testimonial.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="card p-6 relative"
        >
          <div className="absolute top-4 right-4">
            <FiMessageSquare className="w-6 h-6 text-primary-200" />
          </div>
          
          <div className="flex items-center mb-4">
            {[...Array(testimonial.rating)].map((_, i) => (
              <FiStar key={i} className="w-4 h-4 text-yellow-400 fill-current" />
            ))}
          </div>
          
          <p className="text-gray-600 mb-6 italic">
            "{testimonial.text}"
          </p>
          
          <div className="flex items-center">
            <img
              src={testimonial.avatar}
              alt={testimonial.name}
              className="w-12 h-12 rounded-full object-cover mr-4"
            />
            <div>
              <div className="font-semibold text-gray-900">{testimonial.name}</div>
              <div className="text-sm text-gray-500">{testimonial.location}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Testimonials;
