const express = require('express');
const router = express.Router();
const { listUsers, listBusinesses } = require('../controllers/adminController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken, authorize('admin'));

router.get('/users', listUsers);
router.get('/businesses', listBusinesses);

module.exports = router;
