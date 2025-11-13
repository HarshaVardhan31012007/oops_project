const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  highlights: [String],
  bestTimeToVisit: [String],
  tags: [String],
  image: {
    public_id: String,
    url: String,
    caption: String
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

destinationSchema.index({ name: 1, country: 1 }, { unique: true });
destinationSchema.index({ name: 'text', country: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);


