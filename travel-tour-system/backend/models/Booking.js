const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
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
  bookingReference: {
    type: String,
    unique: true
  },
  travelers: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    },
    passportNumber: String,
    nationality: String,
    dietaryRequirements: String,
    medicalConditions: String,
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String
    }
  }],
  travelDates: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    taxes: {
      type: Number,
      default: 0
    },
    fees: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  payment: {
    method: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'razorpay'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentIntentId: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'pending'
  },
  specialRequests: String,
  notes: String,
  cancellationReason: String,
  cancellationDate: Date,
  cancellationPolicy: {
    type: String,
    required: true
  },
  refundEligibility: {
    type: Boolean,
    default: true
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  communication: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'call', 'whatsapp'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  documents: [{
    name: String,
    url: String,
    type: String, // passport, visa, insurance, etc.
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate booking reference before saving
bookingSchema.pre('save', function(next) {
  if (!this.bookingReference) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.bookingReference = `TT${timestamp}${random}`;
  }
  next();
});

// Index for efficient queries
bookingSchema.index({ user: 1, status: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ tourPackage: 1, status: 1 });
bookingSchema.index({ 'travelDates.startDate': 1 });

module.exports = mongoose.model('Booking', bookingSchema);
