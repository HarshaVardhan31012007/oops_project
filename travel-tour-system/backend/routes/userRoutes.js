const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/authMiddleware');
const {
  getProfile,
  updateProfile,
  getUserBookings,
  getUserItineraries,
  getDashboard,
  updatePreferences,
  deleteAccount
} = require('../controllers/userController');

const router = express.Router();

// Validation rules
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const updatePreferencesValidation = [
  body('destinations')
    .optional()
    .isArray()
    .withMessage('Destinations must be an array'),
  body('budget.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum budget must be a number'),
  body('budget.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum budget must be a number'),
  body('travelStyle')
    .optional()
    .isArray()
    .withMessage('Travel style must be an array')
];

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];

// All routes require authentication
router.use(protect);

// Routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.get('/bookings', getUserBookings);
router.get('/itineraries', getUserItineraries);
router.get('/dashboard', getDashboard);
router.put('/preferences', updatePreferencesValidation, updatePreferences);
router.delete('/account', deleteAccountValidation, deleteAccount);

module.exports = router;
