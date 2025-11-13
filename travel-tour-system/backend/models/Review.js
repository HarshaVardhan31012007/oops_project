const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tourPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  detailedRatings: {
    value: {
      type: Number,
      min: 1,
      max: 5
    },
    service: {
      type: Number,
      min: 1,
      max: 5
    },
    guide: {
      type: Number,
      min: 1,
      max: 5
    },
    accommodation: {
      type: Number,
      min: 1,
      max: 5
    },
    transportation: {
      type: Number,
      min: 1,
      max: 5
    },
    food: {
      type: Number,
      min: 1,
      max: 5
    },
    activities: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  pros: [String],
  cons: [String],
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  travelDate: {
    type: Date,
    required: true
  },
  travelerType: {
    type: String,
    enum: ['solo', 'couple', 'family', 'friends', 'business'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderationNotes: String,
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure one review per user per tour
reviewSchema.index({ user: 1, tourPackage: 1 }, { unique: true });

// Index for tour reviews
reviewSchema.index({ tourPackage: 1, status: 1, rating: 1 });

// Index for user reviews
reviewSchema.index({ user: 1, status: 1 });

// Update tour package rating when review is saved
reviewSchema.post('save', async function() {
  if (this.status === 'approved') {
    await this.constructor.updateTourRating(this.tourPackage);
  }
});

// Update tour package rating when review is updated
reviewSchema.post('findOneAndUpdate', async function() {
  if (this.status === 'approved') {
    await this.constructor.updateTourRating(this.tourPackage);
  }
});

// Static method to update tour rating
reviewSchema.statics.updateTourRating = async function(tourPackageId) {
  const TourPackage = mongoose.model('TourPackage');
  
  const stats = await this.aggregate([
    { $match: { tourPackage: tourPackageId, status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await TourPackage.findByIdAndUpdate(tourPackageId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].totalReviews
    });
  }
};

module.exports = mongoose.model('Review', reviewSchema);
