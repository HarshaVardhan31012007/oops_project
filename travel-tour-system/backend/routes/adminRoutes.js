const express = require('express');
const { protect, authorize } = require('../middlewares/authMiddleware');
const {
  getAnalytics,
  getUsers,
  getUserDetails,
  updateUserStatus,
  getTours,
  getBookings,
  getReviews,
  generateReports
} = require('../controllers/adminController');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Analytics and reports
router.get('/analytics', getAnalytics);
router.get('/reports', generateReports);

// User management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Tour management
router.get('/tours', getTours);

// Booking management
router.get('/bookings', getBookings);

// Review management
router.get('/reviews', getReviews);

module.exports = router;
