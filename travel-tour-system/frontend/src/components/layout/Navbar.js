import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings, FiBookOpen, FiPlus } from 'react-icons/fi';
import { clearAuth } from '../../store/slices/authSlice';
import { clearAllBookings } from '../../store/slices/bookingSlice';
import { clearAllTours } from '../../store/slices/tourSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    dispatch(clearAuth());
    dispatch(clearAllBookings());
    dispatch(clearAllTours());
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <FiBookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TravelTour</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/tours"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/tours') 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
              }`}
            >
              Tours
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/itinerary"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/itinerary') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  Create Itinerary
                </Link>
                <Link
                  to="/my-itineraries"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-itineraries') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  My Itineraries
                </Link>
                <Link
                  to="/my-bookings"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/my-bookings') 
                      ? 'text-primary-600 bg-primary-50' 
                      : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  My Bookings
                </Link>
              </>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link
                to="/add-tour"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  isActive('/add-tour') 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
              >
                <FiPlus className="w-4 h-4 mr-1" />
                Add Tour
              </Link>
            )}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{user?.name}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <FiSettings className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FiLogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn btn-primary btn-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/') 
                    ? 'text-primary-600 bg-primary-100' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/tours"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive('/tours') 
                    ? 'text-primary-600 bg-primary-100' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Tours
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/itinerary"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/itinerary') 
                        ? 'text-primary-600 bg-primary-100' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Itinerary
                  </Link>
                  <Link
                    to="/my-itineraries"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/my-itineraries') 
                        ? 'text-primary-600 bg-primary-100' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Itineraries
                  </Link>
                  <Link
                    to="/my-bookings"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/my-bookings') 
                        ? 'text-primary-600 bg-primary-100' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                </>
              )}
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <Link
                    to="/add-tour"
                    className={`block px-3 py-2 rounded-md text-base font-medium flex items-center ${
                      isActive('/add-tour') 
                        ? 'text-primary-600 bg-primary-100' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Add Tour
                  </Link>
                  <Link
                    to="/admin"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/admin') 
                        ? 'text-primary-600 bg-primary-100' 
                        : 'text-gray-700 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Admin
                  </Link>
                </>
              )}
              
              {/* Mobile Auth */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Welcome, {user?.name}
                    </div>
                    <Link
                      to="/profile"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
