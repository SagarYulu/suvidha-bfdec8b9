
const db = require('../config/database');
const bcrypt = require('bcryptjs');

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

      if (filters.status) {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.search) {
        whereClause += ' AND (name LIKE ? OR email LIKE ?)';
        params.push(`%${filters.search}%`, `%${filters.search}%`);
      }

      const query = `
        SELECT id, name, email, role, status, last_login, created_at, updated_at
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
        SELECT id, name, email, role, status, last_login, created_at, updated_at
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

  async getUserByEmail(email) {
    try {
      const query = `
        SELECT *
        FROM dashboard_users
        WHERE email = ?
      `;

      const [rows] = await db.execute(query, [email]);
      return rows[0] || null;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const {
        name,
        email,
        password,
        role = 'employee',
        status = 'active',
        createdBy
      } = userData;

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const query = `
        INSERT INTO dashboard_users (
          name, email, password_hash, role, status, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())
      `;

      const [result] = await db.execute(query, [
        name, email, hashedPassword, role, status
      ]);

      return result.insertId;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const { updatedBy, password, ...data } = updateData;
      
      // Hash password if provided
      if (password) {
        data.password_hash = await bcrypt.hash(password, 10);
      }

      const fields = Object.keys(data);
      const values = Object.values(data);

      if (fields.length === 0) {
        return false;
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
      const query = 'UPDATE dashboard_users SET status = "inactive" WHERE id = ?';
      const [result] = await db.execute(query, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateLastLogin(id) {
    try {
      const query = `
        UPDATE dashboard_users 
        SET last_login = NOW()
        WHERE id = ?
      `;

      await db.execute(query, [id]);
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error for last login update failures
    }
  }
}

module.exports = new UserService();
