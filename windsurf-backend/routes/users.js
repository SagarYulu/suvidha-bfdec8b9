
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get all users (admin only)
router.get('/', [authenticateToken, authorizeRoles('admin', 'hr')], async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, emp_id, role, city, cluster, manager, created_at FROM employees ORDER BY created_at DESC'
    );

    res.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, emp_id, role, city, cluster, manager, created_at FROM employees WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

module.exports = router;
