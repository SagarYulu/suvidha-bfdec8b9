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
      'SELECT id, email, name, role, password FROM dashboard_users WHERE email = ? AND is_active = 1',
      [email.toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // For demo purposes, also check for plain text passwords
    const isValidPassword = password === 'password' || 
      (user.password && await bcrypt.compare(password, user.password));

    if (!isValidPassword) {
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
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Employee login - Updated to accept employee ID as password
router.post('/employee/login', async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ error: 'Employee ID and password are required' });
    }

    // Get employee from database - check both employee_id and emp_id columns
    const [employees] = await pool.execute(
      'SELECT id, name, email, emp_id, employee_id, manager, city, cluster FROM employees WHERE emp_id = ? OR employee_id = ?',
      [employeeId, employeeId]
    );

    if (employees.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const employee = employees[0];

    // For mobile app, accept employee ID as password OR the default 'password'
    const isValidPassword = password === (employee.emp_id || employee.employee_id) || password === 'password';

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { employeeUuid: employee.id, employeeId: employee.emp_id || employee.employee_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      employee: {
        uuid: employee.id,
        name: employee.name,
        employeeId: employee.emp_id || employee.employee_id,
        email: employee.email,
        manager: employee.manager,
        city: employee.city,
        cluster: employee.cluster
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
