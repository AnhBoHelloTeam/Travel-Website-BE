const express = require('express')
const router = express.Router()
const { authenticateToken, authorize } = require('../middleware/auth')
const businessController = require('../controllers/businessController')

// Business routes - chỉ business mới truy cập được
router.use(authenticateToken)
router.use(authorize('business'))

// Quản lý lịch trình của business
router.get('/schedules', businessController.getMySchedules)

// Thống kê doanh thu và vé
router.get('/stats', businessController.getBusinessStats)

// Quản lý thông tin business
router.get('/profile', businessController.getBusinessProfile)
router.put('/profile', businessController.updateBusinessProfile)

module.exports = router
