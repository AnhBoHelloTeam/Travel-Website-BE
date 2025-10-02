const express = require('express');
const router = express.Router();
const { createTicket, listMyTickets, confirmPayment, cancelTicket, adminListTickets } = require('../controllers/ticketController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateTicketBooking } = require('../middleware/validation');

// Protected: list my tickets (customer or business can view their own)
router.get('/', authenticateToken, listMyTickets);

// Protected: create ticket (customer/business)
router.post('/', authenticateToken, authorize('customer', 'business'), validateTicketBooking, createTicket);

// Protected: confirm payment (customer/business)
router.put('/:id/confirm', authenticateToken, authorize('customer', 'business'), confirmPayment);

// Protected: cancel ticket (customer/business)
router.put('/:id/cancel', authenticateToken, authorize('customer', 'business'), cancelTicket);

// Admin: view all tickets
router.get('/admin', authenticateToken, authorize('admin'), adminListTickets);

module.exports = router;
