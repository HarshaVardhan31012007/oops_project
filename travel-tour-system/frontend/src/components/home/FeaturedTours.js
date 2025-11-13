import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiUsers, FiClock, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const FeaturedTours = ({ tours, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="card animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg"></div>
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-1/2"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No featured tours available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {tours.map((tour, index) => (
        <motion.div
          key={tour._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="card group hover:shadow-xl transition-all duration-300"
        >
          <div className="relative overflow-hidden rounded-t-lg">
            <img
              src={tour.images?.[0]?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
              alt={tour.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
              }}
            />
            <div className="absolute top-4 left-4">
              <span className="bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Featured
              </span>
            </div>
            <div className="absolute top-4 right-4">
              <div className="flex items-center bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                <FiStar className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium">{tour.rating?.average || 0}</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex items-center text-sm text-gray-500 mb-2">
              <FiMapPin className="w-4 h-4 mr-1" />
              <span>{tour.destination}, {tour.country}</span>
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
              {tour.title}
            </h3>
            
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {tour.shortDescription}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center">
                <FiClock className="w-4 h-4 mr-1" />
                <span>{tour.duration} days</span>
              </div>
              <div className="flex items-center">
                <FiUsers className="w-4 h-4 mr-1" />
                <span>Max {tour.groupSize?.max} people</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-primary-600">
                  ${tour.price}
                </span>
                {tour.originalPrice && tour.originalPrice > tour.price && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    ${tour.originalPrice}
                  </span>
                )}
                <div className="text-sm text-gray-500">per person</div>
              </div>
              <Link
                to={`/tours/${tour._id}`}
                className="btn btn-primary btn-sm flex items-center"
              >
                View Details
                <FiArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeaturedTours;
