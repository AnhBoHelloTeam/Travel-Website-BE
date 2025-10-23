const express = require('express');
const router = express.Router();
const { listUsers, listBusinesses, listTickets } = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken, authorize('admin'));

router.get('/users', listUsers);
router.get('/businesses', listBusinesses);
router.get('/tickets', listTickets);

module.exports = router;
