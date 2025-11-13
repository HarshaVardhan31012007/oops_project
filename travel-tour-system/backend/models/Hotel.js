const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters']
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
  category: {
    type: String,
    enum: ['budget', 'standard', 'luxury'],
    required: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  pricePerNight: {
    type: Number,
    required: true,
    min: 0
  },
  amenities: [String],
  address: String,
  images: [{
    public_id: String,
    url: String,
    caption: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

hotelSchema.index({ name: 1, destination: 1, country: 1 }, { unique: true });
hotelSchema.index({ destination: 1, country: 1, category: 1, pricePerNight: 1 });

module.exports = mongoose.model('Hotel', hotelSchema);


