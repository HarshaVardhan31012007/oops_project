import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMapPin, FiStar, FiUsers, FiClock, FiCalendar, FiHeart, FiShare2, FiArrowLeft, FiCheck, FiTrash2 } from 'react-icons/fi';
import { fetchTour } from '../store/slices/tourSlice';
import { createBooking } from '../store/slices/bookingSlice';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import PaymentForm from '../components/payment/PaymentForm';
import toast from 'react-hot-toast';
import { reviewAPI } from '../services/api';

const TourDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentTour, currentTourReviews, loading } = useSelector((state) => state.tours);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [travelers, setTravelers] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: '',
    comment: '',
    travelerType: 'solo'
  });
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchTour(id));
    }
  }, [dispatch, id]);

  // Check if user can review this tour
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (isAuthenticated && id) {
        try {
          const response = await reviewAPI.canReviewTour(id);
          const { canReview, reason, message, bookingId } = response.data.data;
          setCanReview(canReview);
          setReviewEligibility({ canReview, reason, message, bookingId });
        } catch (error) {
          console.error('Error checking review eligibility:', error);
          setCanReview(false);
        }
      } else {
        setCanReview(false);
        setReviewEligibility(null);
      }
    };
    checkReviewEligibility();
  }, [isAuthenticated, id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this tour');
      return;
    }
    setShowBookingForm(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }
    
    if (!canReview) {
      toast.error(reviewEligibility?.message || 'You cannot review this tour at the moment');
      return;
    }
    
    if (!reviewData.title || !reviewData.comment || !reviewData.travelerType) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await reviewAPI.submitReview({
        tourPackageId: id,
        bookingId: reviewEligibility?.bookingId,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        travelerType: reviewData.travelerType
      });
      toast.success('Review submitted successfully! It will be visible after approval.');
      setShowReviewForm(false);
      setReviewData({ rating: 5, title: '', comment: '', travelerType: 'solo' });
      // Refresh tour data to get updated reviews and count
      dispatch(fetchTour(id));
      // Re-check eligibility
      const response = await reviewAPI.canReviewTour(id);
      const { canReview, reason, message, bookingId } = response.data.data;
      setCanReview(canReview);
      setReviewEligibility({ canReview, reason, message, bookingId });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setDeletingReviewId(reviewId);
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully!');
      // Refresh tour data to get updated reviews and count
      dispatch(fetchTour(id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Validate required fields
      if (!selectedDate) {
        toast.error('Please select a travel date');
        return;
      }

      // Calculate end date based on tour duration
      const startDate = new Date(selectedDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + (currentTour.duration || 1));

      // Create booking data
      const bookingData = {
        tourPackageId: id,
        travelers: [{
          name: user?.name || 'Guest',
          email: user?.email || 'guest@example.com',
          phone: user?.phone || '1234567890',
          age: 30,
          gender: 'other'
        }],
        travelDates: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        specialRequests: '',
        paymentMethod: 'credit_card'
      };

      // Dispatch create booking action
      await dispatch(createBooking(bookingData)).unwrap();
      
      toast.success('Booking confirmed! You will receive a confirmation email shortly.');
      setShowBookingForm(false);
      setSelectedDate('');
      setTravelers(1);
    } catch (error) {
      toast.error(error || 'Failed to create booking. Please try again.');
    }
  };

  const handlePaymentError = (error) => {
    toast.error(`Payment failed: ${error}`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentTour?.title,
        text: currentTour?.shortDescription,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!currentTour) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tour not found</h2>
          <p className="text-gray-600 mb-8">The tour you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => window.history.back()}
            className="btn btn-primary"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Tours
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tour Images */}
            <div className="mb-8">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={currentTour.images?.[0]?.url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                  alt={currentTour.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
                  }}
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      isFavorited ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-white transition-colors"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tour Info */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <FiMapPin className="w-4 h-4 mr-1" />
                  <span>{currentTour.destination}, {currentTour.country}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{currentTour.title}</h1>
                <div className="flex items-center space-x-6 mb-4">
                  <div className="flex items-center">
                    <FiStar className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{currentTour.rating?.average || 0}</span>
                    <span className="text-gray-500 ml-1">({currentTour.rating?.count || 0} reviews)</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiClock className="w-4 h-4 mr-1" />
                    <span>{currentTour.duration} days</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span>Max {currentTour.groupSize?.max} people</span>
                  </div>
                </div>
                <p className="text-lg text-gray-600">{currentTour.description}</p>
              </div>

              {/* Itinerary */}
              {currentTour.itinerary && currentTour.itinerary.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary</h2>
                  <div className="space-y-4">
                    {currentTour.itinerary.map((day, index) => (
                      <div key={index} className="border-l-4 border-primary-500 pl-4">
                        <h3 className="font-semibold text-gray-900">Day {day.day}: {day.title}</h3>
                        <p className="text-gray-600 mt-1">{day.description}</p>
                        {day.activities && day.activities.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-gray-700">Activities:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {day.activities.map((activity, i) => (
                                <li key={i}>{activity}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                  {isAuthenticated && canReview && (
                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="btn btn-sm btn-primary"
                    >
                      {showReviewForm ? 'Cancel' : 'Write Review'}
                    </button>
                  )}
                </div>

                {/* Review eligibility message */}
                {isAuthenticated && !canReview && reviewEligibility && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    reviewEligibility.reason === 'already_reviewed' 
                      ? 'bg-blue-50 border border-blue-200 text-blue-800'
                      : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
                  }`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {reviewEligibility.reason === 'already_reviewed' ? (
                          <FiCheck className="w-5 h-5" />
                        ) : (
                          <FiClock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{reviewEligibility.message}</p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Review Form */}
                {showReviewForm && isAuthenticated && canReview && (
                  <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex items-center space-x-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewData({ ...reviewData, rating: star })}
                              className="focus:outline-none"
                            >
                              <FiStar
                                className={`w-8 h-8 ${
                                  star <= reviewData.rating
                                    ? 'text-yellow-500 fill-yellow-500'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Review Title</label>
                        <input
                          type="text"
                          value={reviewData.title}
                          onChange={(e) => setReviewData({ ...reviewData, title: e.target.value })}
                          placeholder="Brief summary of your experience"
                          className="input w-full"
                          minLength="5"
                          maxLength="100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea
                          value={reviewData.comment}
                          onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                          placeholder="Tell us about your experience..."
                          className="input w-full h-24 resize-none"
                          minLength="10"
                          maxLength="1000"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Traveler Type *</label>
                        <select
                          value={reviewData.travelerType}
                          onChange={(e) => setReviewData({ ...reviewData, travelerType: e.target.value })}
                          className="input w-full"
                          required
                        >
                          <option value="solo">Solo Traveler</option>
                          <option value="couple">Couple</option>
                          <option value="family">Family</option>
                          <option value="friends">Friends</option>
                          <option value="business">Business</option>
                        </select>
                      </div>
                      
                      <button type="submit" className="btn btn-primary w-full">
                        Submit Review
                      </button>
                    </form>
                  </div>
                )}
                
                {/* Rating Summary */}
                <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center mb-2">
                        <span className="text-4xl font-bold text-gray-900">{currentTour.rating?.average || 0}</span>
                        <span className="text-gray-500 ml-2">/ 5.0</span>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.round(currentTour.rating?.average || 0)
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-gray-900">{currentTour.rating?.count || 0}</p>
                      <p className="text-gray-600">Customer reviews</p>
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div className="space-y-6">
                  {currentTourReviews && currentTourReviews.length > 0 ? (
                    currentTourReviews.map((review) => (
                      <div key={review._id} className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{review.user?.name || 'Anonymous'}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < (review.rating || 0)
                                        ? 'text-yellow-500 fill-yellow-500'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {/* Delete button - only show if user is the review owner */}
                          {isAuthenticated && user && review.user?._id === user._id && (
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              disabled={deletingReviewId === review._id}
                              className="text-red-500 hover:text-red-700 disabled:opacity-50"
                              title="Delete review"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                        <p className="text-gray-700 mb-4">{review.comment || review.text}</p>
                        {review.verified && (
                          <div className="flex items-center text-sm text-green-600">
                            <FiCheck className="w-4 h-4 mr-1" />
                            Verified Purchase
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <p className="text-gray-600">No reviews yet. Be the first to review this tour!</p>
                    </div>
                  )}
                </div>
              </div>
            
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    ${currentTour.price}
                  </div>
                  <div className="text-gray-500">per person</div>
                </div>

                {!showBookingForm ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Date
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="input w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Travelers
                      </label>
                      <select
                        value={travelers}
                        onChange={(e) => setTravelers(parseInt(e.target.value))}
                        className="input w-full"
                      >
                        {[...Array(Math.min(currentTour.groupSize?.max || 10, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1} {i === 0 ? 'Traveler' : 'Travelers'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleBooking}
                      className="btn btn-primary btn-lg w-full"
                    >
                      Book Now
                    </button>

                    <div className="text-center text-sm text-gray-500">
                      <FiCalendar className="w-4 h-4 inline mr-1" />
                      Free cancellation up to 24 hours before departure
                    </div>
                  </div>
                ) : (
                  <PaymentForm
                    amount={currentTour.price * travelers}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourDetails;
