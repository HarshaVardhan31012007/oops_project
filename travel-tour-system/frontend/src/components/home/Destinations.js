import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Destinations = ({ destinations }) => {
  const navigate = useNavigate();
  if (!destinations || destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No destinations available at the moment.</p>
      </div>
    );
  }

  const curated = {
    'Delhi, India': 'https://images.unsplash.com/photo-1582571352031-8f57a9b4fcd7?q=80&w=800&auto=format&fit=crop',
    'Mumbai, India': 'https://images.unsplash.com/photo-1578926374607-1c1f954abdbb?q=80&w=800&auto=format&fit=crop',
    'Jaipur, India': 'https://images.unsplash.com/photo-1585499193151-85dcdc245c54?q=80&w=800&auto=format&fit=crop',
    'Agra, India': 'https://images.unsplash.com/photo-1548013146-0d9f4c1b9457?q=80&w=800&auto=format&fit=crop',
    'Varanasi, India': 'https://images.unsplash.com/photo-1600744226821-3f5cedc7a0c3?q=80&w=800&auto=format&fit=crop',
    'Goa, India': 'https://images.unsplash.com/photo-1548013146-2bbb2955fd05?q=80&w=800&auto=format&fit=crop',
    'Kolkata, India': 'https://images.unsplash.com/photo-1603808033239-69f8f289ec52?q=80&w=800&auto=format&fit=crop',
    'Chennai, India': 'https://images.unsplash.com/photo-1612178537258-4e9acf90d93b?q=80&w=800&auto=format&fit=crop',
    'Bengaluru, India': 'https://images.unsplash.com/photo-1604042468977-927b19d1bd0b?q=80&w=800&auto=format&fit=crop',
    'Hyderabad, India': 'https://images.unsplash.com/photo-1584985473337-660f24f9853d?q=80&w=800&auto=format&fit=crop',
    'Udaipur, India': 'https://images.unsplash.com/photo-1562514948-41bc2b3b4c65?q=80&w=800&auto=format&fit=crop',
    'Rishikesh, India': 'https://images.unsplash.com/photo-1600670610217-b2c0f495fac1?q=80&w=800&auto=format&fit=crop',
    'Kochi, India': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop',
    'Paris, France': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    'London, United Kingdom': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=800&auto=format&fit=crop',
    'Rome, Italy': 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?q=80&w=800&auto=format&fit=crop',
    'Barcelona, Spain': 'https://images.unsplash.com/photo-1464790719320-516ecd75af6c?q=80&w=800&auto=format&fit=crop',
    'Amsterdam, Netherlands': 'https://images.unsplash.com/photo-1517935706615-2717063c2225?q=80&w=800&auto=format&fit=crop',
    'Berlin, Germany': 'https://images.unsplash.com/photo-1509395176047-4a66953fd231?q=80&w=800&auto=format&fit=crop',
    'Prague, Czech Republic': 'https://images.unsplash.com/photo-1526152501824-8f39f9c90d9f?q=80&w=800&auto=format&fit=crop',
    'Vienna, Austria': 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?q=80&w=800&auto=format&fit=crop',
    'Interlaken, Switzerland': 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop',
    'Venice, Italy': 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?q=80&w=800&auto=format&fit=crop',
    'Florence, Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop',
    'New York, USA': 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?q=80&w=800&auto=format&fit=crop',
    'San Francisco, USA': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?q=80&w=800&auto=format&fit=crop',
    'Toronto, Canada': 'https://images.unsplash.com/photo-1486649567693-aaa9b2e59385?q=80&w=800&auto=format&fit=crop',
    'Vancouver, Canada': 'https://images.unsplash.com/photo-1506045412240-22980140a405?q=80&w=800&auto=format&fit=crop',
    'Kyoto, Japan': 'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=800&auto=format&fit=crop',
    'Seoul, South Korea': 'https://images.unsplash.com/photo-1504439468489-c8920d796a29?q=80&w=800&auto=format&fit=crop',
    'Singapore, Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop',
    'Bangkok, Thailand': 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=800&auto=format&fit=crop',
    'Bali, Indonesia': 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=800&auto=format&fit=crop',
    'Dubai, UAE': 'https://images.unsplash.com/photo-1504274066651-8d31a536b11a?q=80&w=800&auto=format&fit=crop',
    'Istanbul, Turkey': 'https://images.unsplash.com/photo-1544989164-31dc3c645987?q=80&w=800&auto=format&fit=crop',
    'Cairo, Egypt': 'https://images.unsplash.com/photo-1544989164-5d36f3e39fb8?q=80&w=800&auto=format&fit=crop',
    'Cape Town, South Africa': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop',
    'Sydney, Australia': 'https://images.unsplash.com/photo-1510742361457-894d1bf93d03?q=80&w=800&auto=format&fit=crop'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {destinations.slice(0, 12).map((destination, index) => (
        <motion.div
          key={`${destination._id.destination}-${destination._id.country}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="group cursor-pointer"
          onClick={() => navigate(`/tours?destination=${encodeURIComponent(destination._id.destination)}&country=${encodeURIComponent(destination._id.country)}`)}
        >
          <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
            <img
              src={destination.image || curated[`${destination._id.destination}, ${destination._id.country}`] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
              alt={`${destination._id.destination}, ${destination._id.country}`}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = curated[`${destination._id.destination}, ${destination._id.country}`] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center mb-1">
                <FiMapPin className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  {destination._id.destination}, {destination._id.country}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">
                  {destination.count} tours available
                </span>
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Destinations;
