import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiMapPin, FiCalendar, FiUsers } from 'react-icons/fi';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [searchData, setSearchData] = useState({
    destination: '',
    startDate: '',
    travelers: 1,
  });
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchData.destination?.trim();
    const params = new URLSearchParams();
    
    if (q) {
      params.append('search', q);
    }
    
    if (searchData.startDate) {
      params.append('startDate', searchData.startDate);
    }
    
    if (searchData.travelers > 1) {
      params.append('travelers', searchData.travelers);
    }
    
    const queryString = params.toString();
    navigate(`/tours${queryString ? '?' + queryString : ''}`);
  };

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gradient-to-r from-blue-900/80 to-purple-900/80">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Travel destination"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Discover Amazing
            <span className="block text-yellow-400">Destinations</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Create unforgettable memories with our curated tour packages and personalized travel experiences
          </p>
          
          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-lg p-6 shadow-2xl max-w-4xl mx-auto"
          >
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative text-left">
                <label className="block text-xs font-medium text-gray-600 mb-1">Where</label>
                <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Where to?"
                  value={searchData.destination}
                  onChange={(e) => setSearchData({ ...searchData, destination: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
              </div>
              
              <div className="relative text-left">
                <label className="block text-xs font-medium text-gray-600 mb-1">From date</label>
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={searchData.startDate}
                  onChange={(e) => setSearchData({ ...searchData, startDate: e.target.value })}
                  min={today}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                  placeholder="Select date"
                />
              </div>
              
              <div className="relative text-left">
                <label className="block text-xs font-medium text-gray-600 mb-1">Travelers</label>
                <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={searchData.travelers}
                  onChange={(e) => setSearchData({ ...searchData, travelers: parseInt(e.target.value) })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Traveler' : 'Travelers'}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary btn-lg flex items-center justify-center h-[52px] mt-5"
              >
                <FiSearch className="w-5 h-5 mr-2" />
                <span>Search Tours</span>
              </button>
            </form>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
              <div className="text-lg">Tours Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">50+</div>
              <div className="text-lg">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">10K+</div>
              <div className="text-lg">Happy Travelers</div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
