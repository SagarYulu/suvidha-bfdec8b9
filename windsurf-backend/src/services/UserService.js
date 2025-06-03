
const database = require('../config/database');
const User = require('../models/User');

class UserService {
  async createUser(userData) {
    const user = new User(userData);
    await user.hashPassword();

    const query = `
      INSERT INTO dashboard_users (
        id, name, email, employee_id, phone, city, cluster, role, password, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      user.id, user.name, user.email, user.employeeId, user.phone,
      user.city, user.cluster, user.role, user.password, user.isActive
    ];

    await database.query(query, params);
    return user.toJSON();
  }

  async getUserById(userId) {
    const query = 'SELECT * FROM dashboard_users WHERE id = ? AND is_active = 1';
    const rows = await database.query(query, [userId]);
    
    if (rows.length === 0) {
      return null;
    }

    return User.fromDatabase(rows[0]).toJSON();
  }

  async getUserByEmail(email) {
    const query = 'SELECT * FROM dashboard_users WHERE email = ? AND is_active = 1';
    const rows = await database.query(query, [email]);
    
    if (rows.length === 0) {
      return null;
    }

    return User.fromDatabase(rows[0]);
  }

  async getAllUsers(filters = {}) {
    let query = 'SELECT * FROM dashboard_users WHERE is_active = 1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }

    query += ' ORDER BY created_at DESC';

    const rows = await database.query(query, params);
    return rows.map(row => User.fromDatabase(row).toJSON());
  }

  async updateUser(userId, updateData) {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updates = [];
    const params = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'id') {
        updates.push(`${key} = ?`);
        params.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      throw new Error('No valid fields to update');
    }

    updates.push('updated_at = ?');
    params.push(new Date());
    params.push(userId);

    const query = `UPDATE dashboard_users SET ${updates.join(', ')} WHERE id = ?`;
    await database.query(query, params);

    return this.getUserById(userId);
  }

  async deleteUser(userId) {
    const query = 'UPDATE dashboard_users SET is_active = 0, updated_at = ? WHERE id = ?';
    const result = await database.query(query, [new Date(), userId]);
    
    if (result.affectedRows === 0) {
      throw new Error('User not found');
    }

    return true;
  }

  async validateCredentials(email, password) {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isValid = await user.validatePassword(password);
    return isValid ? user.toJSON() : null;
  }
}

module.exports = new UserService();
