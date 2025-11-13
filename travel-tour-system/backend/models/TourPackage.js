const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tour title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Tour description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    required: [true, 'Short description is required'],
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  itinerary: [{
    day: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    activities: [String],
    meals: [String], // breakfast, lunch, dinner
    accommodation: String,
    highlights: [String]
  }],
  inclusions: [String],
  exclusions: [String],
  highlights: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'moderate', 'challenging', 'extreme'],
    default: 'easy'
  },
  groupSize: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      required: [true, 'Maximum group size is required']
    }
  },
  ageRestriction: {
    min: Number,
    max: Number
  },
  bestTimeToVisit: [String], // months
  climate: String,
  languages: [String],
  currency: {
    type: String,
    default: 'USD'
  },
  cancellationPolicy: {
    type: String,
    required: true
  },
  bookingDeadline: {
    type: Number, // days before departure
    default: 7
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  bookings: {
    total: {
      type: Number,
      default: 0
    },
    available: {
      type: Number,
      required: [true, 'Available slots is required']
    }
  },
  startDate: Date,
  endDate: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual for calculating discounted price
tourPackageSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Index for search functionality
tourPackageSchema.index({ 
  title: 'text', 
  description: 'text', 
  destination: 'text',
  country: 'text',
  tags: 'text'
});

// Index for filtering
tourPackageSchema.index({ destination: 1, price: 1, duration: 1, isActive: 1 });

module.exports = mongoose.model('TourPackage', tourPackageSchema);
