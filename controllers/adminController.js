const User = require('../models/User');
const Business = require('../models/Business');

// GET /api/admin/users
const listUsers = async (req, res) => {
  try {
    const { email, role, isActive, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = {};
    if (email) filter.email = new RegExp(email, 'i');
    if (role) filter.role = role;
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      User.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('Admin listUsers error:', err);
    res.status(500).json({ success: false, message: 'Failed to list users' });
  }
};

// GET /api/admin/businesses
const listBusinesses = async (req, res) => {
  try {
    const { name, status, ownerId, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = {};
    if (name) filter.name = new RegExp(name, 'i');
    if (status) filter.status = status;
    if (ownerId) filter.ownerId = ownerId;

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    const [items, total] = await Promise.all([
      Business.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      Business.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, pagination: { page: pageNum, limit: pageSize, total, totalPages: Math.ceil(total / pageSize) } });
  } catch (err) {
    console.error('Admin listBusinesses error:', err);
    res.status(500).json({ success: false, message: 'Failed to list businesses' });
  }
};

module.exports = {
  listUsers,
  listBusinesses
};
