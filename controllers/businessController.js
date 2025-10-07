const Schedule = require('../models/Schedule')
const Ticket = require('../models/Ticket')
const User = require('../models/User')

// Business quản lý lịch trình của họ
const getMySchedules = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query
    const businessId = String(req.user._id)

    const filter = { businessId }
    if (status) filter.status = status

    const schedules = await Schedule.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Schedule.countDocuments(filter)

    res.json({
      success: true,
      data: schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get schedules',
      error: error.message
    })
  }
}

// Thống kê doanh thu và vé
const getBusinessStats = async (req, res) => {
  try {
    const businessId = String(req.user._id)

    // Tổng doanh thu
    const revenueResult = await Ticket.aggregate([
      {
        $lookup: {
          from: 'schedules',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'schedule'
        }
      },
      { $unwind: '$schedule' },
      {
        $match: {
          'schedule.businessId': businessId,
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paymentInfo.amount' },
          totalTickets: { $sum: 1 }
        }
      }
    ])

    // Thống kê theo tháng (6 tháng gần nhất)
    const monthlyStats = await Ticket.aggregate([
      {
        $lookup: {
          from: 'schedules',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'schedule'
        }
      },
      { $unwind: '$schedule' },
      {
        $match: {
          'schedule.businessId': businessId,
          status: 'confirmed',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$paymentInfo.amount' },
          tickets: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // Thống kê trạng thái vé
    const statusStats = await Ticket.aggregate([
      {
        $lookup: {
          from: 'schedules',
          localField: 'scheduleId',
          foreignField: '_id',
          as: 'schedule'
        }
      },
      { $unwind: '$schedule' },
      {
        $match: {
          'schedule.businessId': businessId
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    const stats = {
      totalRevenue: revenueResult[0]?.totalRevenue || 0,
      totalTickets: revenueResult[0]?.totalTickets || 0,
      monthlyStats,
      statusStats: statusStats.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {})
    }

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get business stats',
      error: error.message
    })
  }
}

// Cập nhật thông tin business
const updateBusinessProfile = async (req, res) => {
  try {
    const businessId = req.user._id
    const { profile } = req.body

    const updatedUser = await User.findByIdAndUpdate(
      businessId,
      { profile },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      })
    }

    res.json({
      success: true,
      message: 'Business profile updated successfully',
      data: updatedUser
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update business profile',
      error: error.message
    })
  }
}

// Lấy thông tin business
const getBusinessProfile = async (req, res) => {
  try {
    const businessId = req.user._id

    const business = await User.findById(businessId)
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      })
    }

    res.json({
      success: true,
      data: business
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get business profile',
      error: error.message
    })
  }
}

module.exports = {
  getMySchedules,
  getBusinessStats,
  updateBusinessProfile,
  getBusinessProfile
}
