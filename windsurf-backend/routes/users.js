const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all dashboard users
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute(`
      SELECT id, email, name, role, is_active, created_at, updated_at
      FROM dashboard_users
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [users] = await pool.execute(`
      SELECT id, email, name, role, is_active, created_at, updated_at
      FROM dashboard_users
      WHERE id = ?
    `, [userId]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user: users[0] });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Get all employees
router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const [employees] = await pool.execute(`
      SELECT employee_uuid, employee_name, employee_id, city, cluster, manager_name
      FROM employees
      ORDER BY employee_name ASC
    `);

    res.json({ success: true, employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

module.exports = router;
