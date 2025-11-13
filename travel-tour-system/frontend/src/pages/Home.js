import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMapPin, FiStar, FiUsers, FiClock, FiArrowRight } from 'react-icons/fi';
import { fetchFeaturedTours, fetchDestinations } from '../store/slices/tourSlice';
import HeroSection from '../components/home/HeroSection';
import FeaturedTours from '../components/home/FeaturedTours';
import Destinations from '../components/home/Destinations';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredTours, destinations, loading } = useSelector((state) => state.tours);

  useEffect(() => {
    dispatch(fetchFeaturedTours());
    dispatch(fetchDestinations());
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Tours */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Tours
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular and highly-rated tour packages
            </p>
          </div>
          <FeaturedTours tours={featuredTours} loading={loading} />
          <div className="text-center mt-12">
            <Link
              to="/tours"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              View All Tours
              <FiArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Popular Destinations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore amazing destinations around the world
            </p>
          </div>
          <Destinations destinations={destinations} />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <WhyChooseUs />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Read reviews from our satisfied customers
            </p>
          </div>
          <Testimonials />
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Newsletter />
        </div>
      </section>
    </div>
  );
};

export default Home;
