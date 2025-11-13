const Booking = require('../models/Booking');
const TourPackage = require('../models/TourPackage');
const User = require('../models/User');
const { processPayment, generatePaymentReceipt } = require('../utils/paymentGateway');
const { sendBookingConfirmation, sendBookingCancellation } = require('../utils/emailService');
const { validationResult } = require('express-validator');

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { tourPackageId, travelers, travelDates, specialRequests, paymentMethod } = req.body;

    // Get tour package
    const tourPackage = await TourPackage.findById(tourPackageId);
    if (!tourPackage || !tourPackage.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Tour package not found or not available'
      });
    }

    // Check availability
    if (tourPackage.bookings.available <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Tour is fully booked'
      });
    }

    // Calculate pricing
    const basePrice = tourPackage.price;
    const discount = tourPackage.discount || 0;
    const discountAmount = (basePrice * discount) / 100;
    const taxes = (basePrice - discountAmount) * 0.1; // 10% tax
    const fees = (basePrice - discountAmount) * 0.05; // 5% service fee
    const totalAmount = basePrice - discountAmount + taxes + fees;

    // Create booking
    const booking = await Booking.create({
      user: req.user.id,
      tourPackage: tourPackageId,
      travelers,
      travelDates,
      specialRequests,
      pricing: {
        basePrice,
        discount,
        discountAmount,
        taxes,
        fees,
        totalAmount,
        currency: tourPackage.currency || 'USD'
      },
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      cancellationPolicy: tourPackage.cancellationPolicy
    });

    // Process payment
    const paymentData = {
      method: paymentMethod,
      amount: totalAmount,
      currency: tourPackage.currency || 'USD',
      metadata: {
        bookingId: booking._id,
        userId: req.user.id,
        tourId: tourPackageId
      }
    };

    const paymentResult = await processPayment(paymentData);

    if (!paymentResult.success) {
      // Delete booking if payment fails
      await Booking.findByIdAndDelete(booking._id);
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: paymentResult.error
      });
    }

    // Update booking with payment info
    booking.payment.transactionId = paymentResult.transactionId || paymentResult.paymentIntentId;
    booking.payment.paymentIntentId = paymentResult.paymentIntentId;
    booking.payment.status = 'completed';
    booking.payment.paidAt = new Date();
    booking.status = 'confirmed';
    await booking.save();

    // Update tour package availability
    await TourPackage.findByIdAndUpdate(tourPackageId, {
      $inc: { 
        'bookings.total': 1,
        'bookings.available': -1
      }
    });

    // Update user reward points
    const rewardPoints = Math.floor(totalAmount * 0.01); // 1 point per dollar
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { rewardPoints }
    });

    // Send confirmation email
    let emailSent = false;
    try {
      const populatedBooking = await Booking.findById(booking._id)
        .populate('user', 'name email')
        .populate('tourPackage', 'title destination');
      
      await sendBookingConfirmation(populatedBooking);
      emailSent = true;
      console.log('✅ Booking confirmation email sent to:', populatedBooking.user.email);
    } catch (emailError) {
      console.error('⚠️  Booking confirmation email error:', emailError.message);
      console.log('📝 Note: Booking was created successfully, but email notification failed.');
    }

    res.status(201).json({
      success: true,
      message: emailSent 
        ? 'Booking created successfully. Confirmation email sent!' 
        : 'Booking created successfully. Email notification pending.',
      data: {
        booking,
        paymentReceipt: generatePaymentReceipt(booking, paymentResult),
        rewardPoints,
        emailSent
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('tourPackage', 'title destination images duration price');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   DELETE /api/bookings/:id
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { cancellationReason } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('tourPackage', 'title destination');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user owns the booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if booking can be cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel completed booking'
      });
    }

    // Calculate refund amount based on cancellation policy
    const daysUntilTravel = Math.ceil((new Date(booking.travelDates.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    let refundPercentage = 0;

    if (daysUntilTravel > 30) {
      refundPercentage = 100;
    } else if (daysUntilTravel > 14) {
      refundPercentage = 75;
    } else if (daysUntilTravel > 7) {
      refundPercentage = 50;
    } else {
      refundPercentage = 0;
    }

    const refundAmount = (booking.pricing.totalAmount * refundPercentage) / 100;

    // Update booking
    booking.status = 'cancelled';
    booking.cancellationReason = cancellationReason;
    booking.cancellationDate = new Date();
    booking.refundAmount = refundAmount;
    booking.refundEligibility = refundPercentage > 0;
    await booking.save();

    // Update tour package availability
    await TourPackage.findByIdAndUpdate(booking.tourPackage._id, {
      $inc: { 
        'bookings.total': -1,
        'bookings.available': 1
      }
    });

    // Send cancellation email
    try {
      await sendBookingCancellation(booking);
    } catch (emailError) {
      console.error('Booking cancellation email error:', emailError);
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        booking,
        refundAmount,
        refundPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, user } = req.query;
    const query = {};

    if (status) query.status = status;
    if (user) query.user = user;

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('tourPackage', 'title destination')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: {
        bookings,
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

// @desc    Update booking status (Admin)
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    ).populate('user', 'name email')
     .populate('tourPackage', 'title destination');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: { booking }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBooking,
  cancelBooking,
  getAllBookings,
  updateBookingStatus
};
