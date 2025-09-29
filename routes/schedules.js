const express = require('express');
const router = express.Router();
const { listSchedules, createSchedule } = require('../controllers/scheduleController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateSchedule } = require('../middleware/validation');

// Public: list schedules with filters
router.get('/', listSchedules);

// Protected: create schedule (business or admin)
router.post('/', authenticateToken, authorize('business', 'admin'), validateSchedule, createSchedule);

module.exports = router;
