const TourPackage = require('../models/TourPackage');
const Review = require('../models/Review');
const CustomItinerary = require('../models/CustomItinerary');
const { validationResult } = require('express-validator');

// @desc    Get all tours
// @route   GET /api/tours
// @access  Public
const getTours = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      destination,
      country,
      minPrice,
      maxPrice,
      duration,
      difficulty,
      search,
      startDate,
      travelers,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

    if (country) {
      query.country = new RegExp(country, 'i');
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    if (duration) {
      query.duration = parseInt(duration);
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (search) {
      // Only search in title, description, and tags if destination is not filtered
      if (!destination) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }
    }

    // Filter by start date - tours that start on or after the specified date
    if (startDate) {
      const searchDate = new Date(startDate);
      query.startDate = { $gte: searchDate };
    }

    // Filter by travelers - tours that can accommodate the number of travelers
    if (travelers) {
      query['groupSize.max'] = { $gte: parseInt(travelers) };
      query['bookings.available'] = { $gte: parseInt(travelers) };
    }

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    const tours = await TourPackage.find(query)
      .sort(sortObj)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name');

    const total = await TourPackage.countDocuments(query);

    res.json({
      success: true,
      data: {
        tours,
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

// @desc    Get single tour
// @route   GET /api/tours/:id
// @access  Public
const getTour = async (req, res, next) => {
  try {
    const tour = await TourPackage.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    // Get reviews for this tour
    const reviews = await Review.find({ 
      tourPackage: tour._id, 
      status: 'approved' 
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        tour,
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create tour
// @route   POST /api/tours
// @access  Private/Admin
const createTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tourData = {
      ...req.body,
      createdBy: req.user.id
    };

    const tour = await TourPackage.create(tourData);

    res.status(201).json({
      success: true,
      message: 'Tour created successfully',
      data: { tour }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update tour
// @route   PUT /api/tours/:id
// @access  Private/Admin
const updateTour = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const tour = await TourPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour updated successfully',
      data: { tour }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete tour
// @route   DELETE /api/tours/:id
// @access  Private/Admin
const deleteTour = async (req, res, next) => {
  try {
    const tour = await TourPackage.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: 'Tour not found'
      });
    }

    res.json({
      success: true,
      message: 'Tour deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured tours
// @route   GET /api/tours/featured
// @access  Public
const getFeaturedTours = async (req, res, next) => {
  try {
    const tours = await TourPackage.find({ 
      isActive: true, 
      isFeatured: true 
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      data: { tours }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tour destinations
// @route   GET /api/tours/destinations
// @access  Public
const getDestinations = async (req, res, next) => {
  try {
    const destinations = await TourPackage.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          destination: 1,
          country: 1,
          firstImage: { $arrayElemAt: ['$images.url', 0] }
        }
      },
      {
        $group: {
          _id: { destination: '$destination', country: '$country' },
          count: { $sum: 1 },
          image: { $first: '$firstImage' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    res.json({
      success: true,
      data: { destinations }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search tours
// @route   GET /api/tours/search
// @access  Public
const searchTours = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const query = {
      isActive: true,
      $or: [
        { title: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
        { destination: new RegExp(q, 'i') },
        { country: new RegExp(q, 'i') },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    };

    const tours = await TourPackage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('createdBy', 'name');

    const total = await TourPackage.countDocuments(query);

    res.json({
      success: true,
      data: {
        tours,
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

// @desc    Create custom itinerary
// @route   POST /api/tours/custom-itinerary
// @access  Private
const createCustomItinerary = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const itineraryData = {
      ...req.body,
      user: req.user.id,
      duration: req.body.days ? req.body.days.length : 1
    };

    // Calculate total estimated cost
    if (req.body.days && Array.isArray(req.body.days)) {
      itineraryData.totalEstimatedCost = req.body.days.reduce((total, day) => {
        const dayCost = day.estimatedCost || 0;
        const activitiesCost = (day.activities || []).reduce((sum, activity) => sum + (activity.cost || 0), 0);
        const mealsCost = (day.meals || []).reduce((sum, meal) => sum + (meal.cost || 0), 0);
        const transportCost = (day.transportation || []).reduce((sum, transport) => sum + (transport.cost || 0), 0);
        const accommodationCost = day.accommodation ? (day.accommodation.cost || 0) : 0;
        return total + dayCost + activitiesCost + mealsCost + transportCost + accommodationCost;
      }, 0);
    }

    const itinerary = await CustomItinerary.create(itineraryData);

    res.status(201).json({
      success: true,
      message: 'Itinerary saved successfully',
      data: { itinerary }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user custom itineraries
// @route   GET /api/tours/custom-itinerary
// @access  Private
const getCustomItineraries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'draft' } = req.query;

    const itineraries = await CustomItinerary.find({
      user: req.user.id,
      status: status,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CustomItinerary.countDocuments({
      user: req.user.id,
      status: status,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        itineraries,
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

// @desc    Get single custom itinerary
// @route   GET /api/tours/custom-itinerary/:id
// @access  Private
const getCustomItinerary = async (req, res, next) => {
  try {
    const itinerary = await CustomItinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary or it's public
    if (itinerary.user.toString() !== req.user.id && !itinerary.isPublic) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { itinerary }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update custom itinerary
// @route   PUT /api/tours/custom-itinerary/:id
// @access  Private
const updateCustomItinerary = async (req, res, next) => {
  try {
    const itinerary = await CustomItinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = req.body;

    // Recalculate total estimated cost if days are updated
    if (updateData.days && Array.isArray(updateData.days)) {
      updateData.totalEstimatedCost = updateData.days.reduce((total, day) => {
        const dayCost = day.estimatedCost || 0;
        const activitiesCost = (day.activities || []).reduce((sum, activity) => sum + (activity.cost || 0), 0);
        const mealsCost = (day.meals || []).reduce((sum, meal) => sum + (meal.cost || 0), 0);
        const transportCost = (day.transportation || []).reduce((sum, transport) => sum + (transport.cost || 0), 0);
        const accommodationCost = day.accommodation ? (day.accommodation.cost || 0) : 0;
        return total + dayCost + activitiesCost + mealsCost + transportCost + accommodationCost;
      }, 0);
    }

    if (updateData.days) {
      updateData.duration = updateData.days.length;
    }

    const updatedItinerary = await CustomItinerary.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Itinerary updated successfully',
      data: { itinerary: updatedItinerary }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete custom itinerary
// @route   DELETE /api/tours/custom-itinerary/:id
// @access  Private
const deleteCustomItinerary = async (req, res, next) => {
  try {
    const itinerary = await CustomItinerary.findById(req.params.id);

    if (!itinerary) {
      return res.status(404).json({
        success: false,
        message: 'Itinerary not found'
      });
    }

    // Check if user owns the itinerary
    if (itinerary.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await CustomItinerary.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({
      success: true,
      message: 'Itinerary deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};
