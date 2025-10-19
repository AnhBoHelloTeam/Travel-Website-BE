const Schedule = require('../models/Schedule');
const { validationResult } = require('express-validator');

// GET /api/schedules
// Supports filters: routeId, businessId, date (ISO date), vehicleType, status
const listSchedules = async (req, res) => {
  try {
    const {
      routeId,
      businessId,
      vehicleType,
      status,
      date,
      page = 1,
      limit = 20,
      sort = 'departureTime'
    } = req.query;

    const filters = {};

    if (routeId) filters.routeId = routeId;
    if (businessId) filters.businessId = businessId;
    if (vehicleType) filters.vehicleType = vehicleType;
    if (req.query.vehicleCategory) filters.vehicleCategory = req.query.vehicleCategory;
    if (req.query.capacityMin || req.query.capacityMax) {
      filters.capacity = {};
      if (req.query.capacityMin) filters.capacity.$gte = Number(req.query.capacityMin);
      if (req.query.capacityMax) filters.capacity.$lte = Number(req.query.capacityMax);
    }
    if (status) filters.status = status;

    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filters.departureTime = { $gte: start, $lte: end };
    }

    // Route filtering by from/to cities
    if (req.query.from || req.query.to) {
      const Route = require('../models/Route');
      const routeFilters = {};
      if (req.query.from) routeFilters.from = new RegExp(req.query.from, 'i');
      if (req.query.to) routeFilters.to = new RegExp(req.query.to, 'i');
      
      const matchingRoutes = await Route.find(routeFilters).select('_id');
      const routeIds = matchingRoutes.map(route => route._id);
      
      if (routeIds.length > 0) {
        filters.routeId = { $in: routeIds };
      } else {
        // No matching routes found, return empty result
        filters.routeId = { $in: [] };
      }
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    // Only show schedules from approved businesses
    const [items, total] = await Promise.all([
      Schedule.find(filters)
        .populate({
          path: 'routeId',
          select: 'from to distance duration stops',
          match: { isActive: true }
        })
        .populate({
          path: 'businessId',
          select: 'name status',
          match: { status: 'approved' }
        })
        .sort(sort)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize)
        .then(results => results.filter(schedule => 
          schedule.routeId && schedule.businessId // Only include if both route and business are valid
        )),
      Schedule.countDocuments(filters)
    ]);

    res.json({
      success: true,
      data: items,
      pagination: {
        page: pageNum,
        limit: pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    console.error('List schedules error:', error);
    res.status(500).json({ success: false, message: 'Failed to list schedules' });
  }
};

// POST /api/schedules
const createSchedule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const payload = { ...req.body };
    // Enforce business ownership and check business status
    if (req.user && req.user.role === 'business') {
      const Business = require('../models/Business');
      const business = await Business.findOne({ ownerId: req.user._id });
      
      if (!business) {
        return res.status(404).json({ 
          success: false, 
          message: 'Business profile not found. Please create your business profile first.' 
        });
      }
      
      if (business.status !== 'approved') {
        return res.status(403).json({ 
          success: false, 
          message: 'Your business is not approved yet. Please wait for admin approval before creating schedules.' 
        });
      }
      
      payload.businessId = business._id;
    }
    // Auto generate seats by capacity if not provided
    if ((!payload.seats || payload.seats.length === 0) && payload.capacity) {
      const total = Number(payload.capacity) || 0;
      const seatLayout = payload.seatLayout || '2-2';
      const seats = [];
      
      // Parse seat layout (e.g., "2-2" -> [2, 2], "2-1" -> [2, 1])
      const layoutParts = seatLayout.split('-').map(p => parseInt(p.trim(), 10)).filter(n => !isNaN(n));
      const colsPerRow = layoutParts.length > 0 ? layoutParts.reduce((sum, val) => sum + val, 0) : 4;
      
      let seatIndex = 1;
      for (let row = 1; row <= Math.ceil(total / colsPerRow); row++) {
        for (let col = 0; col < colsPerRow && seatIndex <= total; col++) {
          const colChar = String.fromCharCode(65 + col); // A, B, C, D...
          const seatNumber = `${row}${colChar}`;
          
          // Determine seat type based on position (first row = VIP, rest = normal)
          const seatType = row === 1 ? 'vip' : 'normal';
          
          seats.push({
            seatNumber,
            isAvailable: true,
            seatType
          });
          seatIndex++;
        }
      }
      payload.seats = seats;
    }
    const schedule = await Schedule.create(payload);

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create sched-ule' });
  }
};

// GET /api/schedules/:id
const getScheduleById = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate({
        path: 'routeId',
        select: 'from to distance duration stops'
      })
      .populate({
        path: 'businessId',
        select: 'name status rating'
      });
      
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to get schedule' });
  }
};

// PUT /api/schedules/:id
const updateScheduleById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Ownership guard for business role
    const existing = await Schedule.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    if (req.user && req.user.role === 'business') {
      if (String(existing.businessId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You do not own this schedule' });
      }
    }
    const update = { ...req.body };
    if (req.user && req.user.role === 'business') {
      delete update.businessId;
    }
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    res.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule' });
  }
};

// DELETE /api/schedules/:id
const deleteScheduleById = async (req, res) => {
  try {
    const existing = await Schedule.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
    if (req.user && req.user.role === 'business') {
      if (String(existing.businessId) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: 'You do not own this schedule' });
      }
    }
    await Schedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete schedule' });
  }
};

module.exports = {
  listSchedules,
  createSchedule,
  getScheduleById,
  updateScheduleById,
  deleteScheduleById
};
