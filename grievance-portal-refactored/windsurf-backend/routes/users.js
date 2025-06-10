
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const createUserSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'agent', 'employee').required(),
  employee_id: Joi.string().optional(),
  phone: Joi.string().optional(),
  city: Joi.string().optional(),
  cluster: Joi.string().optional(),
  manager: Joi.string().optional()
});

const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('admin', 'agent', 'employee').optional(),
  employee_id: Joi.string().optional(),
  phone: Joi.string().optional(),
  city: Joi.string().optional(),
  cluster: Joi.string().optional(),
  manager: Joi.string().optional(),
  password: Joi.string().min(6).optional()
});

// Get all users
router.get('/', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { 
      role, 
      city, 
      cluster,
      page = 1, 
      limit = 20,
      search
    } = req.query;

    let whereConditions = [];
    let queryParams = [];

    // Add filters
    if (role) {
      whereConditions.push('role = ?');
      queryParams.push(role);
    }

    if (city) {
      whereConditions.push('city = ?');
      queryParams.push(city);
    }

    if (cluster) {
      whereConditions.push('cluster = ?');
      queryParams.push(cluster);
    }

    if (search) {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR employee_id LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM dashboard_users
      ${whereClause}
    `, queryParams);

    const totalCount = countResult[0].total;
    const totalPages = Math.ceil(totalCount / limit);
    const offset = (page - 1) * limit;

    // Get users with pagination
    const [users] = await db.execute(`
      SELECT 
        id, name, email, role, employee_id, phone, city, cluster, manager, created_at, updated_at
      FROM dashboard_users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), parseInt(offset)]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by ID
router.get('/:id', authenticateToken, requireRole(['admin', 'agent']), async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await db.execute(`
      SELECT 
        id, name, email, role, employee_id, phone, city, cluster, manager, created_at, updated_at
      FROM dashboard_users 
      WHERE id = ?
    `, [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create new user
router.post('/', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { error, value } = createUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, password, role, employee_id, phone, city, cluster, manager } = value;

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM dashboard_users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = uuidv4();
    await db.execute(`
      INSERT INTO dashboard_users (
        id, name, email, password, role, employee_id, phone, city, cluster, manager, 
        created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [userId, name, email, hashedPassword, role, employee_id, phone, city, cluster, manager, req.user.id]);

    const user = {
      id: userId,
      name,
      email,
      role,
      employee_id,
      phone,
      city,
      cluster,
      manager
    };

    res.status(201).json({ 
      userId, 
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM dashboard_users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if email is being changed and if it already exists
    if (value.email) {
      const [emailCheck] = await db.execute(
        'SELECT id FROM dashboard_users WHERE email = ? AND id != ?',
        [value.email, id]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ error: 'Email already exists' });
      }
    }

    const updateFields = [];
    const updateValues = [];

    Object.keys(value).forEach(key => {
      if (value[key] !== undefined) {
        if (key === 'password') {
          updateFields.push(`${key} = ?`);
          updateValues.push(bcrypt.hashSync(value[key], 10));
        } else {
          updateFields.push(`${key} = ?`);
          updateValues.push(value[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updateFields.push('last_updated_by = ?', 'updated_at = NOW()');
    updateValues.push(req.user.id, id);

    await db.execute(`
      UPDATE dashboard_users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, updateValues);

    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const [existingUsers] = await db.execute('SELECT id FROM dashboard_users WHERE id = ?', [id]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user
    await db.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get user roles and permissions
router.get('/:id/roles', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const [roles] = await db.execute(`
      SELECT r.id, r.name, r.description
      FROM rbac_roles r
      JOIN rbac_user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ?
    `, [id]);

    const [permissions] = await db.execute(`
      SELECT DISTINCT p.id, p.name, p.description
      FROM rbac_permissions p
      JOIN rbac_role_permissions rp ON p.id = rp.permission_id
      JOIN rbac_user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ?
    `, [id]);

    res.json({ roles, permissions });
  } catch (error) {
    console.error('Get user roles error:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

module.exports = router;
