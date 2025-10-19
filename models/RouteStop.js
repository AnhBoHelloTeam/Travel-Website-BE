const mongoose = require('mongoose')

const routeStopSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  estimatedTime: {
    type: Number,
    required: true,
    min: 0
  },
  order: {
    type: Number,
    required: true,
    min: 1
  }
}, {
  timestamps: true
})

// Index for efficient queries
routeStopSchema.index({ routeId: 1, order: 1 })

module.exports = mongoose.model('RouteStop', routeStopSchema)
