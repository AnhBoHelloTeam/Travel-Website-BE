const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  from: {
    type: String,
    required: [true, 'Departure location is required'],
    trim: true
  },
  to: {
    type: String,
    required: [true, 'Destination location is required'],
    trim: true
  },
  distance: {
    type: Number,
    required: [true, 'Distance is required'],
    min: [0, 'Distance must be positive']
  },
  duration: {
    type: Number, // in minutes
    required: [true, 'Duration is required'],
    min: [0, 'Duration must be positive']
  },
  stops: [{
    name: {
      type: String,
      required: true
    },
    address: String,
    order: {
      type: Number,
      required: true
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
routeSchema.index({ from: 1, to: 1, isActive: 1 });

module.exports = mongoose.model('Route', routeSchema);
