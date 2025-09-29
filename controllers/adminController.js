const User = require('../models/User');

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

// GET /api/admin/businesses (from users where role = 'business')
const listBusinesses = async (req, res) => {
  try {
    const { email, name, isActive, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const filter = { role: 'business' };
    if (email) filter.email = new RegExp(email, 'i');
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    // name filter checks profile firstName/lastName concatenation
    if (name) {
      filter.$or = [
        { 'profile.firstName': new RegExp(name, 'i') },
        { 'profile.lastName': new RegExp(name, 'i') }
      ];
    }

    const pageNum = Math.max(parseInt(page, 10), 1);
    const pageSize = Math.min(Math.max(parseInt(limit, 10), 1), 100);

    const [items, total] = await Promise.all([
      User.find(filter).sort(sort).skip((pageNum - 1) * pageSize).limit(pageSize),
      User.countDocuments(filter)
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
