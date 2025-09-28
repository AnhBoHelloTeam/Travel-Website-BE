const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: [true, 'Route ID is required']
  },
  departureTime: {
    type: Date,
    required: [true, 'Departure time is required']
  },
  arrivalTime: {
    type: Date,
    required: [true, 'Arrival time is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  vehicleType: {
    type: String,
    enum: ['sitting', 'sleeping'],
    required: [true, 'Vehicle type is required']
  },
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    seatType: {
      type: String,
      enum: ['normal', 'vip'],
      default: 'normal'
    }
  }],
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: [true, 'Business ID is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled'],
    default: 'active'
  },
  maxSeats: {
    type: Number,
    default: 40
  }
}, {
  timestamps: true
});

// Index for better query performance
scheduleSchema.index({ departureTime: 1, routeId: 1 });
scheduleSchema.index({ businessId: 1, status: 1 });

module.exports = mongoose.model('Schedule', scheduleSchema);
