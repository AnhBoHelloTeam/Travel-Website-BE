const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Business name is required'],
    trim: true
  },
  license: {
    type: String,
    required: [true, 'Business license is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Business email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Business phone is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Business address is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  services: [{
    type: String,
    enum: ['sitting', 'sleeping', 'vip', 'normal']
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  documents: [{
    type: {
      type: String,
      enum: ['license', 'insurance', 'vehicle_registration']
    },
    url: String,
    uploadedAt: Date
  }],
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
  }
}, {
  timestamps: true
});

// Index for better query performance
businessSchema.index({ status: 1, ownerId: 1 });
businessSchema.index({ name: 1, status: 1 });

module.exports = mongoose.model('Business', businessSchema);
