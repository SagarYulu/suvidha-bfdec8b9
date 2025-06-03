
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    
    let whereClause = '';
    let params = [];
    
    if (role) {
      whereClause = 'WHERE role = ?';
      params.push(role);
    }

    const offset = (page - 1) * limit;

    // Get total count
    const [countResult] = await db.execute(
      `SELECT COUNT(*) as total FROM dashboard_users ${whereClause}`,
      params
    );

    // Get users
    const [users] = await db.execute(`
      SELECT id, name, email, role, phone, employee_id, city, cluster, created_at
      FROM dashboard_users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own data unless they're admin
    if (req.user.role === 'employee' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [users] = await db.execute(
      'SELECT id, name, email, role, phone, employee_id, city, cluster, created_at FROM dashboard_users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      // Try employees table
      const [employees] = await db.execute(
        'SELECT id, name, email, role, phone, emp_id as employee_id, city, cluster, created_at FROM employees WHERE id = ?',
        [id]
      );
      
      if (employees.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.json(employees[0]);
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user (admin only)
router.post('/', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const schema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().required(),
      phone: Joi.string().optional(),
      employeeId: Joi.string().optional(),
      city: Joi.string().optional(),
      cluster: Joi.string().optional()
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role, phone, employeeId, city, cluster } = value;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM dashboard_users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    await db.execute(`
      INSERT INTO dashboard_users (
        id, name, email, password, role, phone, employee_id, 
        city, cluster, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      userId, name, email.toLowerCase(), hashedPassword, role, 
      phone, employeeId, city, cluster, req.user.id
    ]);

    res.status(201).json({ 
      userId, 
      message: 'User created successfully',
      user: { id: userId, name, email: email.toLowerCase(), role }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own data unless they're admin
    if (req.user.role === 'employee' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const schema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().optional(),
      city: Joi.string().optional(),
      cluster: Joi.string().optional(),
      role: Joi.string().optional() // Only admins can change roles
    });

    const { error, value } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Remove role from updates if user is not admin
    if (req.user.role === 'employee') {
      delete value.role;
    }

    const updates = [];
    const params = [];
    
    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        updates.push(`${key} = ?`);
        params.push(val);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    updates.push('updated_at = NOW()');
    if (req.user.role !== 'employee') {
      updates.push('last_updated_by = ?');
      params.push(req.user.id);
    }
    params.push(id);

    await db.execute(
      `UPDATE dashboard_users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin', 'security-admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Don't allow users to delete themselves
    if (req.user.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const [result] = await db.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
