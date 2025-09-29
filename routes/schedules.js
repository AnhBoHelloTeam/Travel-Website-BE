const express = require('express');
const router = express.Router();
const { listSchedules, createSchedule, getScheduleById, updateScheduleById, deleteScheduleById } = require('../controllers/scheduleController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateSchedule } = require('../middleware/validation');

// Public: list schedules with filters
router.get('/', listSchedules);

// Public: get schedule by id
router.get('/:id', getScheduleById);

// Protected: create schedule (business or admin)
router.post('/', authenticateToken, authorize('business', 'admin'), validateSchedule, createSchedule);

// Protected: update schedule (business or admin)
router.put('/:id', authenticateToken, authorize('business', 'admin'), validateSchedule, updateScheduleById);

// Protected: delete schedule (business or admin)
router.delete('/:id', authenticateToken, authorize('business', 'admin'), deleteScheduleById);

module.exports = router;
