const express = require('express');
const { body } = require('express-validator');
const { protect, authorize, optionalAuth } = require('../middlewares/authMiddleware');
const {
  getTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  getFeaturedTours,
  getDestinations,
  searchTours,
  createCustomItinerary,
  getCustomItineraries,
  getCustomItinerary,
  updateCustomItinerary,
  deleteCustomItinerary
} = require('../controllers/tourController');

const router = express.Router();

// Validation rules for creating/updating tours
const tourValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('shortDescription')
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage('Short description must be between 20 and 300 characters'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required'),
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be at least 1 day'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('groupSize.max')
    .isInt({ min: 1 })
    .withMessage('Maximum group size must be at least 1'),
  body('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'challenging', 'extreme'])
    .withMessage('Invalid difficulty level'),
  body('inclusions')
    .isArray({ min: 1 })
    .withMessage('At least one inclusion is required'),
  body('exclusions')
    .isArray()
    .withMessage('Exclusions must be an array'),
  body('itinerary')
    .isArray({ min: 1 })
    .withMessage('At least one day itinerary is required')
];

// Public routes
router.get('/', optionalAuth, getTours);
router.get('/featured', getFeaturedTours);
router.get('/destinations', getDestinations);
router.get('/search', searchTours);

// Custom Itinerary routes (must be before /:id route)
router.post('/custom-itinerary', protect, createCustomItinerary);
router.get('/custom-itinerary', protect, getCustomItineraries);
router.get('/custom-itinerary/:id', protect, getCustomItinerary);
router.put('/custom-itinerary/:id', protect, updateCustomItinerary);
router.delete('/custom-itinerary/:id', protect, deleteCustomItinerary);

// Tour detail route (must be after custom-itinerary routes)
router.get('/:id', optionalAuth, getTour);

// Protected routes (Admin only)
router.post('/', protect, authorize('admin'), tourValidation, createTour);
router.put('/:id', protect, authorize('admin'), tourValidation, updateTour);
router.delete('/:id', protect, authorize('admin'), deleteTour);

module.exports = router;
