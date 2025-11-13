const Review = require('../models/Review');
const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const { validationResult } = require('express-validator');

// @desc    Submit review
// @route   POST /api/reviews
// @access  Private
const submitReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      tourPackageId, 
      bookingId, 
      rating, 
      title, 
      comment, 
      detailedRatings,
      pros,
      cons,
      wouldRecommend,
      travelerType,
      images
    } = req.body;

    // Check if tour package exists
    const tourPackage = await TourPackage.findById(tourPackageId);
    if (!tourPackage) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found'
      });
    }

    // Check if user has a completed booking for this tour
    const completedBooking = await Booking.findOne({
      user: req.user.id,
      tourPackage: tourPackageId,
      status: { $in: ['completed', 'confirmed'] }
    });

    if (!completedBooking) {
      return res.status(403).json({
        success: false,
        message: 'You can only review tours after completing the booking. Please complete your tour first.'
      });
    }

    // If bookingId is provided, verify it belongs to the user and is completed or confirmed
    if (bookingId) {
      const booking = await Booking.findOne({
        _id: bookingId,
        user: req.user.id,
        tourPackage: tourPackageId,
        status: { $in: ['completed', 'confirmed'] }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or not completed'
        });
      }
    }

    // Check if user already reviewed this tour
    const existingReview = await Review.findOne({
      user: req.user.id,
      tourPackage: tourPackageId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this tour'
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user.id,
      tourPackage: tourPackageId,
      booking: bookingId || completedBooking._id,
      rating,
      title,
      comment,
      detailedRatings,
      pros,
      cons,
      wouldRecommend,
      travelerType,
      images,
      travelDate: completedBooking.travelDates.startDate,
      status: 'pending',
      isVerified: true // Mark as verified since we confirmed the completed booking
    });

    // Update booking with review reference
    await Booking.findByIdAndUpdate(bookingId || completedBooking._id, {
      $push: { reviews: review._id }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a tour
// @route   GET /api/reviews/tour/:tourId
// @access  Public
const getTourReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, rating, sort = 'createdAt', order = 'desc' } = req.query;
    
    const query = { 
      tourPackage: req.params.tourId, 
      status: 'approved' 
    };

    if (rating) {
      query.rating = parseInt(rating);
    }

    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    // Get rating statistics
    const ratingStats = await Review.aggregate([
      { $match: { tourPackage: req.params.tourId, status: 'approved' } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    let stats = {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };

    if (ratingStats.length > 0) {
      const data = ratingStats[0];
      stats.averageRating = Math.round(data.averageRating * 10) / 10;
      stats.totalReviews = data.totalReviews;
      
      // Calculate rating distribution
      data.ratingDistribution.forEach(rating => {
        stats.ratingDistribution[rating]++;
      });
    }

    res.json({
      success: true,
      data: {
        reviews,
        stats,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user reviews
// @route   GET /api/reviews/user
// @access  Private
const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { user: req.user.id };
    
    if (status) {
      query.status = status;
    }

    const reviews = await Review.find(query)
      .populate('tourPackage', 'title destination images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/reviews/:id/helpful
// @access  Private
const markHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check if user already marked as helpful
    const alreadyMarked = review.helpful.users.includes(req.user.id);
    
    if (alreadyMarked) {
      // Remove from helpful
      review.helpful.users.pull(req.user.id);
      review.helpful.count -= 1;
    } else {
      // Add to helpful
      review.helpful.users.push(req.user.id);
      review.helpful.count += 1;
    }

    await review.save();

    res.json({
      success: true,
      message: alreadyMarked ? 'Removed from helpful' : 'Marked as helpful',
      data: { helpfulCount: review.helpful.count }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
// @access  Private/Admin
const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, tourPackage, user } = req.query;
    const query = {};

    if (status) query.status = status;
    if (tourPackage) query.tourPackage = tourPackage;
    if (user) query.user = user;

    const reviews = await Review.find(query)
      .populate('user', 'name email')
      .populate('tourPackage', 'title destination')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Moderate review (Admin)
// @route   PUT /api/reviews/:id/moderate
// @access  Private/Admin
const moderateReview = async (req, res, next) => {
  try {
    const { status, moderationNotes } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        status,
        moderationNotes,
        moderatedBy: req.user.id,
        moderatedAt: new Date()
      },
      { new: true }
    ).populate('user', 'name email')
     .populate('tourPackage', 'title destination');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review moderated successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if user can review a tour
// @route   GET /api/reviews/can-review/:tourId
// @access  Private
const canReviewTour = async (req, res, next) => {
  try {
    const tourId = req.params.tourId;
    const userId = req.user.id;

    // Check if user has a completed booking for this tour
    const completedBooking = await Booking.findOne({
      user: userId,
      tourPackage: tourId,
      status: { $in: ['completed', 'confirmed'] }
    });

    if (!completedBooking) {
      return res.json({
        success: true,
        data: {
          canReview: false,
          reason: 'no_completed_booking',
          message: 'You must complete a booking for this tour before you can review it.'
        }
      });
    }

    // Check if user already reviewed this tour
    const existingReview = await Review.findOne({
      user: userId,
      tourPackage: tourId
    });

    if (existingReview) {
      return res.json({
        success: true,
        data: {
          canReview: false,
          reason: 'already_reviewed',
          message: 'You have already submitted a review for this tour.',
          reviewId: existingReview._id
        }
      });
    }

    // User can review
    res.json({
      success: true,
      data: {
        canReview: true,
        bookingId: completedBooking._id,
        message: 'You can submit a review for this tour.'
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReview,
  getTourReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  moderateReview,
  canReviewTour
};
