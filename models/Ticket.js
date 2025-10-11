const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  scheduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: [true, 'Schedule ID is required']
  },
  seatNumber: {
    type: String,
    required: [true, 'Seat number is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'expired'],
    default: 'pending'
  },
  // NEW: Pickup and dropoff points
  pickupPoint: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    estimatedTime: {
      type: Number, // minutes from departure
      required: true
    }
  },
  dropoffPoint: {
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    estimatedTime: {
      type: Number, // minutes from departure
      required: true
    }
  },
  passengerInfo: {
    firstName: {
      type: String,
      required: [true, 'Passenger first name is required']
    },
    lastName: {
      type: String,
      required: [true, 'Passenger last name is required']
    },
    phone: {
      type: String,
      required: [true, 'Passenger phone is required']
    },
    email: {
      type: String,
      required: [true, 'Passenger email is required']
    }
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['momo', 'vnpay', 'cash'],
      required: [true, 'Payment method is required']
    },
    transactionId: String,
    amount: {
      type: Number,
      required: [true, 'Payment amount is required']
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  cancellationInfo: {
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending'
    }
  },
  expiresAt: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
ticketSchema.index({ userId: 1, status: 1 });
ticketSchema.index({ scheduleId: 1, seatNumber: 1 });
ticketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Ticket', ticketSchema);
