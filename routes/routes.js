const express = require('express')
const router = express.Router()
const Route = require('../models/Route')

// Public list of routes with basic filters
router.get('/', async (req, res) => {
  try {
    const { from, to, isActive = 'true', page = 1, limit = 50, sort = 'from' } = req.query
    const filter = {}
    if (from) filter.from = new RegExp(from, 'i')
    if (to) filter.to = new RegExp(to, 'i')
    if (isActive) filter.isActive = isActive === 'true'

    const pageNum = Math.max(parseInt(page, 10), 1)
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 200)

    const [items, total] = await Promise.all([
      Route.find(filter)
        .populate('stops')
        .sort(sort)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
      Route.countDocuments(filter)
    ])

    res.json({ success: true, data: items, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to list routes' })
  }
})

// GET /api/routes/:id - Get specific route details
router.get('/:id', async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate('stops')
    
    if (!route) {
      return res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
      })
    }
    
    // Get additional stops from RouteStop collection
    const RouteStop = require('../models/RouteStop')
    const additionalStops = await RouteStop.find({ 
      routeId: req.params.id
    }).sort({ order: 1 })
    
    // Combine route stops with additional stops
    const allStops = [
      ...(route.stops || []),
      ...additionalStops
    ].sort((a, b) => (a.order || 0) - (b.order || 0))
    
    const routeWithStops = {
      ...route.toObject(),
      stops: allStops
    }
    
    res.json({ 
      success: true, 
      data: routeWithStops 
    })
  } catch (error) {
    console.error('Get route error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch route' 
    })
  }
})

// GET /api/routes/:id/stops - Get stops for a specific route
router.get('/:id/stops', async (req, res) => {
  try {
    const RouteStop = require('../models/RouteStop')
    
    const route = await Route.findById(req.params.id)
    if (!route) {
      return res.status(404).json({ 
        success: false, 
        message: 'Route not found' 
      })
    }
    
    // Get stops from RouteStop collection
    const stops = await RouteStop.find({ 
      routeId: req.params.id
    }).sort({ order: 1 })
    
    res.json({ 
      success: true, 
      data: stops 
    })
  } catch (error) {
    console.error('Get route stops error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch route stops' 
    })
  }
})

module.exports = router
