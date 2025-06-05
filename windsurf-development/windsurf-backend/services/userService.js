
const db = require('../config/database');

class UserService {
  async getUsers(filters = {}, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      let whereClause = 'WHERE 1=1';
      const params = [];

      if (filters.role) {
        whereClause += ' AND role = ?';
        params.push(filters.role);
      }

      if (filters.search) {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const query = `
        SELECT id, name, email, role, employee_id, created_at, updated_at
        FROM dashboard_users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const countQuery = `
        SELECT COUNT(*) as total
        FROM dashboard_users
        ${whereClause}
      `;

      const [users] = await db.execute(query, [...params, limit, offset]);
      const [countResult] = await db.execute(countQuery, params);

      return {
        users,
        total: countResult[0].total
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const query = `
        SELECT id, name, email, role, employee_id, created_at, updated_at
        FROM dashboard_users
        WHERE id = ?
      `;

      const [rows] = await db.execute(query, [id]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const { name, email, password, role, employee_id } = userData;
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = require('uuid').v4();

      const query = `
        INSERT INTO dashboard_users (id, name, email, password, role, employee_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      await db.execute(query, [id, name, email, hashedPassword, role, employee_id]);
      return id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const fields = Object.keys(updateData);
      const values = Object.values(updateData);

      if (fields.length === 0) {
        return false;
      }

      // Hash password if it's being updated
      if (updateData.password) {
        const bcrypt = require('bcryptjs');
        const index = fields.indexOf('password');
        values[index] = await bcrypt.hash(updateData.password, 10);
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const query = `
        UPDATE dashboard_users 
        SET ${setClause}, updated_at = NOW()
        WHERE id = ?
      `;

      const [result] = await db.execute(query, [...values, id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const query = 'DELETE FROM dashboard_users WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
