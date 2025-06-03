
const bcrypt = require('bcryptjs');
const db = require('../config/database');

const usersService = {
  async getUsers() {
    const query = `
      SELECT id, name, email, employee_id, phone, city, cluster, role, created_at, updated_at
      FROM dashboard_users
      ORDER BY created_at DESC
    `;

    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  async getEmployees() {
    const query = `
      SELECT id, name, email, emp_id, phone, city, cluster, manager, role, created_at
      FROM employees
      ORDER BY name ASC
    `;

    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },

  async getUserById(userId, requestingUser) {
    const requestingUserId = requestingUser.id;
    const userRole = requestingUser.role;

    // Users can only view their own profile unless they're admin
    if (userId !== requestingUserId && !['admin', 'support'].includes(userRole)) {
      throw new Error('Access denied');
    }

    const query = `
      SELECT id, name, email, employee_id, phone, city, cluster, role, created_at, updated_at
      FROM dashboard_users
      WHERE id = ?
    `;

    const users = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  },

  async createUser(userData, createdBy) {
    const { email, password, name, employeeId, role, phone, city, cluster } = userData;

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM dashboard_users WHERE email = ?';
    const existingUsers = await new Promise((resolve, reject) => {
      db.query(checkUserQuery, [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (existingUsers.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const insertQuery = `
      INSERT INTO dashboard_users (name, email, employee_id, phone, city, cluster, role, password, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.query(insertQuery, [name, email, employeeId, phone, city, cluster, role, hashedPassword, createdBy], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return {
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    };
  },

  async updateUser(userId, updateData, requestingUser) {
    const requestingUserId = requestingUser.id;
    const userRole = requestingUser.role;
    const { email, name, employeeId, phone, city, cluster, role, password } = updateData;

    // Users can only update their own profile unless they're admin
    if (userId !== requestingUserId && userRole !== 'admin') {
      throw new Error('Access denied');
    }

    // Only admins can change roles
    if (role && userRole !== 'admin') {
      throw new Error('Only admins can change user roles');
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
      throw new Error('No fields to update');
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateFields.push('last_updated_by = ?');
    updateValues.push(requestingUserId);
    updateValues.push(userId);

    const updateQuery = `UPDATE dashboard_users SET ${updateFields.join(', ')} WHERE id = ?`;

    const result = await new Promise((resolve, reject) => {
      db.query(updateQuery, updateValues, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
  },

  async deleteUser(userId, requestingUserId) {
    // Prevent self-deletion
    if (userId === requestingUserId) {
      throw new Error('Cannot delete your own account');
    }

    const deleteQuery = 'DELETE FROM dashboard_users WHERE id = ?';

    const result = await new Promise((resolve, reject) => {
      db.query(deleteQuery, [userId], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }
  }
};

module.exports = usersService;
