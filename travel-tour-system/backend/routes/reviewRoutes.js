const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  submitReview,
  getTourReviews,
  getUserReviews,
  updateReview,
  deleteReview,
  markHelpful,
  getAllReviews,
  moderateReview,
  canReviewTour
} = require('../controllers/reviewController');

const router = express.Router();

// Validation rules
const submitReviewValidation = [
  body('tourPackageId')
    .isMongoId()
    .withMessage('Valid tour package ID is required'),
  body('bookingId')
    .optional()
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('travelerType')
    .isIn(['solo', 'couple', 'family', 'friends', 'business'])
    .withMessage('Valid traveler type is required'),
  body('detailedRatings.value')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Value rating must be between 1 and 5'),
  body('detailedRatings.service')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service rating must be between 1 and 5'),
  body('detailedRatings.guide')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Guide rating must be between 1 and 5'),
  body('detailedRatings.accommodation')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Accommodation rating must be between 1 and 5'),
  body('detailedRatings.transportation')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Transportation rating must be between 1 and 5'),
  body('detailedRatings.food')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Food rating must be between 1 and 5'),
  body('detailedRatings.activities')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Activities rating must be between 1 and 5')
];

const updateReviewValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
];

const moderateReviewValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'flagged'])
    .withMessage('Valid status is required')
];

// Public routes
router.get('/tour/:tourId', getTourReviews);

// Protected routes
router.use(protect);

// User routes
router.get('/can-review/:tourId', canReviewTour);
router.post('/', submitReviewValidation, submitReview);
router.get('/user', getUserReviews);
router.put('/:id', updateReviewValidation, updateReview);
router.delete('/:id', deleteReview);
router.post('/:id/helpful', markHelpful);

// Admin routes
router.get('/', authorize('admin'), getAllReviews);
router.put('/:id/moderate', authorize('admin'), moderateReviewValidation, moderateReview);

module.exports = router;
