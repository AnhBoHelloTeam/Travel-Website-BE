const Ticket = require('../models/Ticket');
const Schedule = require('../models/Schedule');
const { redisClient } = require('../config/database');

// Helper: Redis key for seat lock
const seatLockKey = (scheduleId, seatNumber) => `seat_lock:${scheduleId}:${seatNumber}`;

// POST /api/tickets
// Reserve a seat: set Redis lock for 5 minutes and create a pending ticket
const createTicket = async (req, res) => {
  try {
    const { scheduleId, seatNumber, passengerInfo, paymentInfo } = req.body;

    // Ensure schedule exists and seat is still available
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const seat = schedule.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) {
      return res.status(400).json({ success: false, message: 'Seat not found on this schedule' });
    }

    // Check seat lock in Redis
    const client = redisClient();
    const lockKey = seatLockKey(scheduleId, seatNumber);
    const existingLock = await client.get(lockKey);
    if (existingLock) {
      return res.status(409).json({ success: false, message: 'Seat is temporarily locked, please try another seat or wait' });
    }

    // Also ensure not already booked in DB (status confirmed)
    const existingConfirmed = await Ticket.findOne({ scheduleId, seatNumber, status: { $in: ['pending', 'confirmed'] } });
    if (existingConfirmed) {
      return res.status(409).json({ success: false, message: 'Seat is already reserved or booked' });
    }

    // Create pending ticket (expiresAt set by model TTL index)
    const ticket = await Ticket.create({
      userId: req.user._id,
      scheduleId,
      seatNumber,
      status: 'pending',
      passengerInfo,
      paymentInfo
    });

    // Lock seat in Redis for 5 minutes (300 seconds)
    await client.set(lockKey, ticket._id.toString(), { EX: 300, NX: true });

    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ success: false, message: 'Failed to create ticket' });
  }
};

// GET /api/tickets (current user's tickets)
const listMyTickets = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    const [items, total] = await Promise.all([
      Ticket.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      Ticket.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('List my tickets error:', err);
    res.status(500).json({ success: false, message: 'Failed to list tickets' });
  }
};

// PUT /api/tickets/:id/confirm
// Confirm payment and mark ticket as confirmed
const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionId } = req.body;

    const ticket = await Ticket.findOne({ _id: id, userId: req.user._id, status: 'pending' });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Pending ticket not found' });
    }

    // Update ticket status and payment info
    ticket.status = 'confirmed';
    ticket.paymentInfo.status = 'completed';
    ticket.paymentInfo.transactionId = transactionId;
    ticket.paymentInfo.paidAt = new Date();
    await ticket.save();

    // Remove Redis lock
    const client = redisClient();
    const lockKey = seatLockKey(ticket.scheduleId, ticket.seatNumber);
    await client.del(lockKey);

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Confirm payment error:', err);
    res.status(500).json({ success: false, message: 'Failed to confirm payment' });
  }
};

// PUT /api/tickets/:id/cancel
// Cancel ticket (only if pending or confirmed)
const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ticket = await Ticket.findOne({ _id: id, userId: req.user._id, status: { $in: ['pending', 'confirmed'] } });
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found or cannot be cancelled' });
    }

    // Update ticket status
    ticket.status = 'cancelled';
    ticket.cancellationInfo = {
      cancelledAt: new Date(),
      reason: reason || 'User cancelled'
    };
    await ticket.save();

    // Remove Redis lock if exists
    const client = redisClient();
    const lockKey = seatLockKey(ticket.scheduleId, ticket.seatNumber);
    await client.del(lockKey);

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('Cancel ticket error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel ticket' });
  }
};

// GET /api/admin/tickets (admin view all tickets)
const adminListTickets = async (req, res) => {
  try {
    const { userId, scheduleId, status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (scheduleId) filter.scheduleId = scheduleId;
    if (status) filter.status = status;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    const [items, total] = await Promise.all([
      Ticket.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      Ticket.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('Admin list tickets error:', err);
    res.status(500).json({ success: false, message: 'Failed to list tickets' });
  }
};

module.exports = {
  createTicket,
  listMyTickets,
  confirmPayment,
  cancelTicket,
  adminListTickets
};
