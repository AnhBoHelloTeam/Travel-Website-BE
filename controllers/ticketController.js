const Ticket = require('../models/Ticket');
const Schedule = require('../models/Schedule');

// POST /api/tickets
// Create a ticket (simplified version without Redis)
const createTicket = async (req, res) => {
  try {
    const { scheduleId, seatNumber, passengerInfo, paymentInfo, pickupPoint, dropoffPoint } = req.body;

    // Ensure schedule exists and seat is still available
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    const seat = schedule.seats.find((s) => s.seatNumber === seatNumber);
    if (!seat) {
      return res.status(400).json({ success: false, message: 'Seat not found on this schedule' });
    }

    if (!seat.isAvailable) {
      return res.status(409).json({ success: false, message: 'Seat is not available' });
    }

    // Check if seat is already booked
    const existingTicket = await Ticket.findOne({ scheduleId, seatNumber, status: { $in: ['pending', 'confirmed'] } });
    if (existingTicket) {
      return res.status(409).json({ success: false, message: 'Seat is already reserved or booked' });
    }

    // Create ticket
    const ticket = await Ticket.create({
      userId: req.user._id,
      scheduleId,
      seatNumber,
      status: 'pending',
      passengerInfo,
      paymentInfo,
      pickupPoint,
      dropoffPoint
    });

    // Update seat availability in schedule
    const seatIndex = schedule.seats.findIndex((s) => s.seatNumber === seatNumber);
    if (seatIndex !== -1) {
      schedule.seats[seatIndex].isAvailable = false;
      await schedule.save();
    }

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
    if (ticket.paymentInfo) {
      ticket.paymentInfo.status = 'completed';
      ticket.paymentInfo.transactionId = transactionId;
      ticket.paymentInfo.paidAt = new Date();
    }
    await ticket.save();

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

    // Make seat available again
    const schedule = await Schedule.findById(ticket.scheduleId);
    if (schedule) {
      const seatIndex = schedule.seats.findIndex((s) => s.seatNumber === ticket.seatNumber);
      if (seatIndex !== -1) {
        schedule.seats[seatIndex].isAvailable = true;
        await schedule.save();
      }
    }

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
