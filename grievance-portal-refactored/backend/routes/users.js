
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const query = `
      SELECT id, name, email, employee_id, phone, city, cluster, role, created_at, updated_at
      FROM dashboard_users
      ORDER BY created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        users: results
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all employees
router.get('/employees', authenticateToken, authorizeRoles('admin', 'support'), (req, res) => {
  try {
    const query = `
      SELECT id, name, email, emp_id, phone, city, cluster, manager, role, created_at
      FROM employees
      ORDER BY name ASC
    `;

    db.query(query, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({
        success: true,
        employees: results
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single user
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;

    // Users can only view their own profile unless they're admin
    if (userId !== requestingUserId && !['admin', 'support'].includes(userRole)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = `
      SELECT id, name, email, employee_id, phone, city, cluster, role, created_at, updated_at
      FROM dashboard_users
      WHERE id = ?
    `;

    db.query(query, [userId], (err, results) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['employee', 'admin', 'support'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, employeeId, role, phone, city, cluster } = req.body;
    const createdBy = req.user.id;

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
        INSERT INTO dashboard_users (name, email, employee_id, phone, city, cluster, role, password, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.query(insertQuery, [name, email, employeeId, phone, city, cluster, role, hashedPassword, createdBy], (err, result) => {
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

// Update user
router.put('/:id', authenticateToken, [
  body('email').optional().isEmail().normalizeEmail(),
  body('name').optional().notEmpty().trim(),
  body('role').optional().isIn(['employee', 'admin', 'support'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.params.id;
    const requestingUserId = req.user.id;
    const userRole = req.user.role;
    const { email, name, employeeId, phone, city, cluster, role, password } = req.body;

    // Users can only update their own profile unless they're admin
    if (userId !== requestingUserId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Only admins can change roles
    if (role && userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles' });
    }

    let updateFields = [];
    let updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (employeeId) {
      updateFields.push('employee_id = ?');
      updateValues.push(employeeId);
    }

    if (phone) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }

    if (city) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }

    if (cluster) {
      updateFields.push('cluster = ?');
      updateValues.push(cluster);
    }

    if (role && userRole === 'admin') {
      updateFields.push('role = ?');
      updateValues.push(role);
    }

    if (password) {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateFields.push('last_updated_by = ?');
    updateValues.push(requestingUserId);
    updateValues.push(userId);

    const updateQuery = `UPDATE dashboard_users SET ${updateFields.join(', ')} WHERE id = ?`;

    db.query(updateQuery, updateValues, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update user' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'User updated successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  try {
    const userId = req.params.id;
    const requestingUserId = req.user.id;

    // Prevent self-deletion
    if (userId === requestingUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deleteQuery = 'DELETE FROM dashboard_users WHERE id = ?';

    db.query(deleteQuery, [userId], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete user' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
