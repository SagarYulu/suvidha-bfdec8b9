
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { authenticateToken, authenticateEmployee } = require('../middleware/auth');

const router = express.Router();

// Admin login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const [users] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Employee login
router.post('/employee/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get employee from database
    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE employee_email = ?',
      [email]
    );

    if (employees.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const employee = employees[0];

    // Check password
    const validPassword = await bcrypt.compare(password, employee.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { employeeUuid: employee.employee_uuid, email: employee.employee_email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: employee.employee_uuid,
        name: employee.employee_name,
        email: employee.employee_email,
        employeeId: employee.employee_id
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Verify employee token
router.get('/employee/verify', authenticateEmployee, (req, res) => {
  res.json({ success: true, user: req.employee });
});

module.exports = router;
