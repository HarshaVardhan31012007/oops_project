const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  createBooking,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

const router = express.Router();

// Validation rules
const createBookingValidation = [
  body('tourPackageId')
    .isMongoId()
    .withMessage('Valid tour package ID is required'),
  body('travelers')
    .isArray({ min: 1 })
    .withMessage('At least one traveler is required'),
  body('travelers.*.name')
    .trim()
    .notEmpty()
    .withMessage('Traveler name is required'),
  body('travelers.*.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid traveler email is required'),
  body('travelers.*.phone')
    .isMobilePhone()
    .withMessage('Valid traveler phone is required'),
  body('travelers.*.age')
    .isInt({ min: 1, max: 120 })
    .withMessage('Valid traveler age is required'),
  body('travelers.*.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Valid gender is required'),
  body('travelDates.startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('travelDates.endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay'])
    .withMessage('Valid payment method is required')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Valid status is required')
];

// Protected routes
router.use(protect);

// User routes
router.post('/', createBookingValidation, createBooking);
router.get('/:id', getBooking);
router.delete('/:id', cancelBooking);

// Admin routes
router.get('/', authorize('admin'), getAllBookings);
router.put('/:id/status', authorize('admin'), updateStatusValidation, updateBookingStatus);

module.exports = router;
