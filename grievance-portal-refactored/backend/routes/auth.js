
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').optional().isIn(['employee', 'admin', 'support'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, employeeId, role = 'employee', phone, city, cluster } = req.body;

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM dashboard_users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const insertQuery = `
        INSERT INTO dashboard_users (name, email, employee_id, phone, city, cluster, role, password)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.query(insertQuery, [name, email, employeeId, phone, city, cluster, role, hashedPassword], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to create user' });
        }

        res.status(201).json({
          success: true,
          message: 'User created successfully',
          userId: result.insertId
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const query = 'SELECT * FROM dashboard_users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = results[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      delete user.password;

      res.json({
        success: true,
        token,
        user
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify token
router.get('/verify', authenticateToken, (req, res) => {
  const query = 'SELECT id, name, email, role, employee_id, phone, city, cluster FROM dashboard_users WHERE id = ?';
  db.query(query, [req.user.id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: results[0]
    });
  });
});

// Employee login (using employee ID)
router.post('/employee/login', [
  body('employeeId').notEmpty().trim(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, password } = req.body;

    // Find employee
    const query = 'SELECT * FROM employees WHERE emp_id = ?';
    db.query(query, [employeeId], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const employee = results[0];

      // Check password (either employee ID or 'password')
      const validPassword = password === employee.emp_id || password === 'password' || 
                           await bcrypt.compare(password, employee.password);
      
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create JWT token
      const token = jwt.sign(
        { 
          id: employee.id,
          email: employee.email,
          role: employee.role || 'employee',
          name: employee.name,
          employeeId: employee.emp_id
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from response
      delete employee.password;

      res.json({
        success: true,
        token,
        employee
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
