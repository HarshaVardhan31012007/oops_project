import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiEye, FiX, FiStar } from 'react-icons/fi';
import { getUserBookings, cancelBooking, clearAllBookings } from '../store/slices/bookingSlice';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { bookings, loading } = useSelector((state) => state.bookings);
  const { user } = useSelector((state) => state.auth);
  const [cancellingId, setCancellingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    // Clear bookings and fetch fresh data when component mounts or user changes
    dispatch(clearAllBookings());
    dispatch(getUserBookings());
  }, [dispatch, user?._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      setCancellingId(bookingId);
      const reason = prompt('Please provide a reason for cancellation (optional):');
      await dispatch(cancelBooking({ id: bookingId, reason: reason || 'User requested' })).unwrap();
      toast.success('Booking cancelled successfully');
      dispatch(getUserBookings());
    } catch (error) {
      toast.error(error || 'Failed to cancel booking');
    } finally {
      setCancellingId(null);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleWriteReview = (tourId) => {
    navigate(`/tours/${tourId}`);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-lg text-gray-600">
            Manage your tour bookings and view booking history
          </p>
        </div>

        {bookings && bookings.length > 0 ? (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="card p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {booking.tourPackage?.title}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <FiMapPin className="w-4 h-4 mr-2" />
                          <span>{booking.tourPackage?.destination}</span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <FiCalendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(booking.travelDates.startDate).toLocaleDateString()} - 
                            {new Date(booking.travelDates.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FiUsers className="w-4 h-4 mr-2" />
                          <span>{booking.travelers.length} travelers</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                        <div className="mt-2 text-2xl font-bold text-primary-600">
                          ${booking.pricing.totalAmount}
                        </div>
                        <div className="text-sm text-gray-500">
                          Booking #{booking.bookingReference}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleViewDetails(booking)}
                        className="btn btn-outline btn-sm flex items-center"
                      >
                        <FiEye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      {booking.status === 'completed' && (
                        <button
                          onClick={() => handleWriteReview(booking.tourPackage?._id)}
                          className="btn btn-outline btn-sm text-primary-600 hover:bg-primary-50 flex items-center"
                        >
                          <FiStar className="w-4 h-4 mr-2" />
                          Write Review
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingId === booking._id}
                          className="btn btn-outline btn-sm text-red-600 hover:bg-red-50 flex items-center disabled:opacity-50"
                        >
                          <FiX className="w-4 h-4 mr-2" />
                          {cancellingId === booking._id ? 'Cancelling...' : 'Cancel Booking'}
                        </button>
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
              <FiCalendar className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-4">
              Start exploring our amazing tours and book your first adventure!
            </p>
            <a
              href="/tours"
              className="btn btn-primary"
            >
              Browse Tours
            </a>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
                <button onClick={closeDetailsModal} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Tour Information</h3>
                  <p className="text-gray-700"><strong>Title:</strong> {selectedBooking.tourPackage?.title}</p>
                  <p className="text-gray-700"><strong>Destination:</strong> {selectedBooking.tourPackage?.destination}</p>
                  <p className="text-gray-700"><strong>Booking Reference:</strong> {selectedBooking.bookingReference}</p>
                  <p className="text-gray-700"><strong>Status:</strong> <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedBooking.status)}`}>{selectedBooking.status}</span></p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Travel Dates</h3>
                  <p className="text-gray-700"><strong>Start:</strong> {new Date(selectedBooking.travelDates.startDate).toLocaleDateString()}</p>
                  <p className="text-gray-700"><strong>End:</strong> {new Date(selectedBooking.travelDates.endDate).toLocaleDateString()}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Travelers ({selectedBooking.travelers.length})</h3>
                  {selectedBooking.travelers.map((traveler, index) => (
                    <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
                      <p className="text-gray-700"><strong>Name:</strong> {traveler.name}</p>
                      <p className="text-gray-700"><strong>Email:</strong> {traveler.email}</p>
                      <p className="text-gray-700"><strong>Phone:</strong> {traveler.phone}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Payment Details</h3>
                  <p className="text-gray-700"><strong>Base Price:</strong> ${selectedBooking.pricing.basePrice}</p>
                  <p className="text-gray-700"><strong>Taxes:</strong> ${selectedBooking.pricing.taxes}</p>
                  <p className="text-gray-700"><strong>Fees:</strong> ${selectedBooking.pricing.fees}</p>
                  <p className="text-lg font-bold text-gray-900 mt-2"><strong>Total:</strong> ${selectedBooking.pricing.totalAmount}</p>
                  <p className="text-gray-700"><strong>Payment Status:</strong> {selectedBooking.payment.status}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button onClick={closeDetailsModal} className="btn btn-primary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
