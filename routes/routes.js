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
      Route.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      Route.countDocuments(filter)
    ])

    res.json({ success: true, data: items, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } })
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to list routes' })
  }
})

module.exports = router
