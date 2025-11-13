import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { FiSearch, FiFilter, FiMapPin, FiStar, FiUsers, FiClock, FiArrowRight, FiEdit, FiTrash2 } from 'react-icons/fi';
import { fetchTours, setFilters, setSort, clearFilters } from '../store/slices/tourSlice';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const Tours = () => {
  const dispatch = useDispatch();
  const { tours, loading, pagination, filters, sort } = useSelector((state) => state.tours);
  const { user } = useSelector((state) => state.auth);
  const [showFilters, setShowFilters] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Get URL parameters and update filters
    const urlSearch = searchParams.get('search');
    const urlStartDate = searchParams.get('startDate');
    const urlTravelers = searchParams.get('travelers');
    const urlDestination = searchParams.get('destination');
    const urlCountry = searchParams.get('country');
    
    // Reset filters and apply only URL parameters
    const filterUpdates = {
      destination: '',
      country: '',
      minPrice: '',
      maxPrice: '',
      duration: '',
      difficulty: '',
      search: '',
      startDate: '',
      travelers: ''
    };
    
    // Update with URL parameters if they exist
    if (urlSearch) {
      filterUpdates.search = urlSearch;
    }
    if (urlStartDate) {
      filterUpdates.startDate = urlStartDate;
    }
    if (urlTravelers) {
      filterUpdates.travelers = urlTravelers;
    }
    if (urlDestination) {
      filterUpdates.destination = urlDestination;
    }
    if (urlCountry) {
      filterUpdates.country = urlCountry;
    }
    
    // Always update filters with clean state
    dispatch(setFilters(filterUpdates));
  }, [searchParams, dispatch]);

  useEffect(() => {
    // Fetch tours when filters or sort change
    dispatch(fetchTours({ ...filters, ...sort, page: 1 }));
  }, [dispatch, filters, sort]);

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSortChange = (field, order) => {
    dispatch(setSort({ field, order }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already in filters, just refetch
    dispatch(fetchTours({ ...filters, ...sort, page: 1 }));
  };

  const clearAllFilters = () => {
    dispatch(clearFilters());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Amazing Tours</h1>
          <p className="text-lg text-gray-600">
            Find your perfect adventure from our curated collection of tours
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative h-12">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                placeholder="Search tours, destinations, or activities..."
                className="input pl-10 w-full h-12"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-outline flex items-center"
            >
              <FiFilter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <input
                  type="text"
                  placeholder="Enter destination"
                  value={filters.destination}
                  onChange={(e) => handleFilterChange('destination', e.target.value)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="Enter country"
                  value={filters.country}
                  onChange={(e) => handleFilterChange('country', e.target.value)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <select
                  value={filters.duration}
                  onChange={(e) => handleFilterChange('duration', e.target.value)}
                  className="input h-12"
                >
                  <option value="">Any duration</option>
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">1 week</option>
                  <option value="14">2 weeks</option>
                  <option value="30">1 month</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="input h-12"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="input h-12"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="input h-12"
                >
                  <option value="">Any difficulty</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                  <option value="extreme">Extreme</option>
                </select>
              </div>
            </div>
          )}

          {/* Sort Options */}
          <div className="flex items-center space-x-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={`${sort.field}-${sort.order}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                handleSortChange(field, order);
              }}
              className="input"
            >
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Highest rated</option>
              <option value="duration-asc">Shortest duration</option>
              <option value="duration-desc">Longest duration</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {tours.length} of {pagination.total} tours
          </p>
        </div>

        {/* Tours Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : tours.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.map((tour) => (
              <div key={tour._id} className="card group hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden rounded-t-lg">
                  <img
                    src={tour.images?.[0]?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'}
                    alt={tour.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                    }}
                  />
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
                    <div className="flex gap-2">
                      <Link
                        to={`/tours/${tour._id}`}
                        className="btn btn-primary btn-sm flex items-center"
                      >
                        View Details
                        <FiArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                      {user?.role === 'admin' && (
                        <>
                          <button className="btn btn-outline btn-sm text-blue-600 hover:bg-blue-50">
                            <FiEdit className="w-4 h-4" />
                          </button>
                          <button className="btn btn-outline btn-sm text-red-600 hover:bg-red-50">
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tours found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={clearAllFilters}
              className="btn btn-primary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex justify-center mt-12">
            <nav className="flex items-center space-x-2">
              <button
                disabled={pagination.current === 1}
                className="btn btn-outline btn-sm disabled:opacity-50"
                onClick={() => dispatch(fetchTours({ ...filters, ...sort, page: pagination.current - 1 }))}
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => dispatch(fetchTours({ ...filters, ...sort, page: index + 1 }))}
                  className={`btn btn-sm ${
                    pagination.current === index + 1
                      ? 'btn-primary'
                      : 'btn-outline'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                disabled={pagination.current === pagination.pages}
                className="btn btn-outline btn-sm disabled:opacity-50"
                onClick={() => dispatch(fetchTours({ ...filters, ...sort, page: pagination.current + 1 }))}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tours;
