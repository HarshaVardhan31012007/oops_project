const mongoose = require('mongoose');

const customItinerarySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Itinerary title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
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
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  budget: {
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  travelers: {
    adults: {
      type: Number,
      required: true,
      min: 1
    },
    children: {
      type: Number,
      default: 0,
      min: 0
    },
    infants: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  travelStyle: [String], // adventure, luxury, budget, family, solo, cultural, nature
  interests: [String], // photography, history, food, nightlife, shopping, etc.
  days: [{
    dayNumber: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    activities: [{
      name: {
        type: String,
        required: true
      },
      description: String,
      time: String,
      duration: String,
      cost: {
        type: Number,
        default: 0
      },
      location: String,
      coordinates: {
        lat: Number,
        lng: Number
      },
      category: {
        type: String,
        enum: ['sightseeing', 'activity', 'meal', 'transportation', 'accommodation', 'shopping', 'entertainment']
      },
      bookingRequired: {
        type: Boolean,
        default: false
      },
      bookingInfo: {
        website: String,
        phone: String,
        email: String,
        notes: String
      }
    }],
    meals: [{
      type: {
        type: String,
        enum: ['breakfast', 'lunch', 'dinner', 'snack']
      },
      name: String,
      location: String,
      cost: Number,
      time: String
    }],
    accommodation: {
      name: String,
      type: {
        type: String,
        enum: ['hotel', 'hostel', 'apartment', 'resort', 'camping', 'homestay']
      },
      location: String,
      cost: Number,
      bookingInfo: {
        website: String,
        phone: String,
        email: String
      }
    },
    transportation: [{
      type: {
        type: String,
        enum: ['flight', 'train', 'bus', 'car', 'taxi', 'walking', 'bike', 'boat']
      },
      from: String,
      to: String,
      cost: Number,
      duration: String,
      bookingInfo: {
        website: String,
        phone: String,
        email: String
      }
    }],
    notes: String,
    estimatedCost: Number
  }],
  totalEstimatedCost: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  tags: [String],
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  shares: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'completed', 'cancelled'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
customItinerarySchema.index({ 
  title: 'text', 
  description: 'text', 
  destination: 'text',
  country: 'text',
  tags: 'text'
});

// Index for filtering
customItinerarySchema.index({ 
  user: 1, 
  destination: 1, 
  country: 1, 
  isPublic: 1, 
  status: 1 
});

// Virtual for calculating total cost
customItinerarySchema.virtual('calculatedTotalCost').get(function() {
  return this.days.reduce((total, day) => {
    const dayCost = day.estimatedCost || 0;
    const activitiesCost = day.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0);
    const mealsCost = day.meals.reduce((sum, meal) => sum + (meal.cost || 0), 0);
    const transportCost = day.transportation.reduce((sum, transport) => sum + (transport.cost || 0), 0);
    const accommodationCost = day.accommodation ? (day.accommodation.cost || 0) : 0;
    
    return total + dayCost + activitiesCost + mealsCost + transportCost + accommodationCost;
  }, 0);
});

module.exports = mongoose.model('CustomItinerary', customItinerarySchema);
