
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all users with pagination and filtering
router.get('/', authenticateToken, requireRole(['admin', 'super-admin']), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, role } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (department) {
      whereConditions.push('department = ?');
      queryParams.push(department);
    }

    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total FROM users ${whereClause}
    `, queryParams);

    // Get users with pagination
    const [users] = await db.execute(`
      SELECT id, name, email, phone, employee_id, department, manager, city, cluster, role, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

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
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id, name, email, phone, employee_id, department, manager, city, cluster, role, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.params.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticateToken, requireRole(['admin', 'super-admin']), async (req, res) => {
  try {
    const { name, email, phone, employee_id, department, manager, city, cluster, role = 'employee' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const userId = uuidv4();

    await db.execute(`
      INSERT INTO users (id, name, email, phone, employee_id, department, manager, city, cluster, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, name, email, phone, employee_id, department, manager, city, cluster, role]);

    res.status(201).json({
      userId,
      message: 'User created successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or employee ID already exists' });
    }
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, email, phone, employee_id, department, manager, city, cluster, role } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.execute(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, employee_id = ?, department = ?, manager = ?, city = ?, cluster = ?, role = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, email, phone, employee_id, department, manager, city, cluster, role, userId]);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email or employee ID already exists' });
    }
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requireRole(['admin', 'super-admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await db.execute('DELETE FROM users WHERE id = ?', [userId]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
