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
    if (status) filters.status = status;

    if (date) {
      const d = new Date(date);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end = new Date(d.setHours(23, 59, 59, 999));
      filters.departureTime = { $gte: start, $lte: end };
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    const [items, total] = await Promise.all([
      Schedule.find(filters)
        .sort(sort)
        .skip((pageNum - 1) * pageSize)
        .limit(pageSize),
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

    const payload = req.body;
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
    const schedule = await Schedule.findById(req.params.id);
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

    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
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
    const schedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }
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
