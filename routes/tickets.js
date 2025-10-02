const express = require('express');
const router = express.Router();
const { createTicket, listMyTickets } = require('../controllers/ticketController');
const { authenticateToken, authorize } = require('../middleware/auth');
const { validateTicketBooking } = require('../middleware/validation');

// Protected: list my tickets (customer or business can view their own)
router.get('/', authenticateToken, listMyTickets);

// Protected: create ticket (customer/business)
router.post('/', authenticateToken, authorize('customer', 'business'), validateTicketBooking, createTicket);

module.exports = router;
