
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

const userController = {
  // Get all users with filtering and pagination
  async getUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, search } = req.query;
      const offset = (page - 1) * limit;

      let query = 'SELECT * FROM dashboard_users WHERE 1=1';
      const params = [];

      if (role) {
        query += ' AND role = ?';
        params.push(role);
      }

      if (search) {
        query += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${search}%`, `%${search}%`);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), parseInt(offset));

      const [users] = await pool.execute(query, params);

      // Count total for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM dashboard_users WHERE 1=1';
      const countParams = [];

      if (role) {
        countQuery += ' AND role = ?';
        countParams.push(role);
      }

      if (search) {
        countQuery += ' AND (name LIKE ? OR email LIKE ?)';
        countParams.push(`%${search}%`, `%${search}%`);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      res.json({
        data: {
          users: users.map(user => ({
            ...user,
            password: undefined // Remove password from response
          })),
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Get single user
  async getUser(req, res) {
    try {
      const { id } = req.params;

      const [users] = await pool.execute(
        'SELECT * FROM dashboard_users WHERE id = ?',
        [id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = users[0];
      delete user.password; // Remove password from response

      res.json({ data: user });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Create new user
  async createUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, role, password, phone, employee_id, city, cluster, manager } = req.body;

      // Check if user already exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM dashboard_users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const [result] = await pool.execute(
        `INSERT INTO dashboard_users 
         (name, email, password, role, phone, employee_id, city, cluster, manager, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, email, hashedPassword, role, phone, employee_id, city, cluster, manager, req.user.id]
      );

      res.status(201).json({
        data: {
          id: result.insertId,
          name,
          email,
          role,
          phone,
          employee_id,
          city,
          cluster,
          manager
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  // Update user
  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, email, role, password, phone, employee_id, city, cluster, manager } = req.body;

      // Check if user exists
      const [existingUsers] = await pool.execute(
        'SELECT * FROM dashboard_users WHERE id = ?',
        [id]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prepare update data
      const updateData = { name, email, role, phone, employee_id, city, cluster, manager };
      const updateFields = [];
      const updateValues = [];

      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value);
        }
      });

      // Handle password update if provided
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateFields.push('password = ?');
        updateValues.push(hashedPassword);
      }

      updateFields.push('last_updated_by = ?');
      updateValues.push(req.user.id);

      updateValues.push(id);

      await pool.execute(
        `UPDATE dashboard_users SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );

      res.json({ message: 'User updated successfully' });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Check if user exists
      const [existingUsers] = await pool.execute(
        'SELECT id FROM dashboard_users WHERE id = ?',
        [id]
      );

      if (existingUsers.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Don't allow users to delete themselves
      if (id === req.user.id) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      await pool.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  // Bulk create users
  async bulkCreateUsers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { users } = req.body;
      const results = [];
      const errors_list = [];

      for (const userData of users) {
        try {
          const { name, email, role, password, phone, employee_id, city, cluster, manager } = userData;

          // Check if user already exists
          const [existingUsers] = await pool.execute(
            'SELECT id FROM dashboard_users WHERE email = ?',
            [email]
          );

          if (existingUsers.length > 0) {
            errors_list.push({ email, error: 'User already exists' });
            continue;
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password || 'defaultPassword123', 12);

          // Create user
          const [result] = await pool.execute(
            `INSERT INTO dashboard_users 
             (name, email, password, role, phone, employee_id, city, cluster, manager, created_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, role, phone, employee_id, city, cluster, manager, req.user.id]
          );

          results.push({
            id: result.insertId,
            email,
            name,
            status: 'created'
          });
        } catch (error) {
          errors_list.push({ email: userData.email, error: error.message });
        }
      }

      res.json({
        data: {
          created: results,
          errors: errors_list,
          summary: {
            total: users.length,
            created: results.length,
            failed: errors_list.length
          }
        }
      });
    } catch (error) {
      console.error('Bulk create users error:', error);
      res.status(500).json({ error: 'Failed to create users' });
    }
  },

  // Validate bulk users
  async validateBulkUsers(req, res) {
    try {
      const { users } = req.body;
      const validUsers = [];
      const invalidUsers = [];

      for (const userData of users) {
        const { name, email, role } = userData;
        const errors = [];

        if (!name || name.trim() === '') {
          errors.push('Name is required');
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push('Valid email is required');
        }

        if (!role || role.trim() === '') {
          errors.push('Role is required');
        }

        // Check if user already exists
        const [existingUsers] = await pool.execute(
          'SELECT id FROM dashboard_users WHERE email = ?',
          [email]
        );

        if (existingUsers.length > 0) {
          errors.push('User with this email already exists');
        }

        if (errors.length > 0) {
          invalidUsers.push({ ...userData, errors });
        } else {
          validUsers.push(userData);
        }
      }

      res.json({
        data: {
          valid: validUsers,
          invalid: invalidUsers,
          summary: {
            total: users.length,
            valid: validUsers.length,
            invalid: invalidUsers.length
          }
        }
      });
    } catch (error) {
      console.error('Validate bulk users error:', error);
      res.status(500).json({ error: 'Failed to validate users' });
    }
  }
};

module.exports = userController;
