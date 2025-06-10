
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class UserService {
  async getUsers(filters = {}, page = 1, limit = 10) {
    try {
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

      const offset = (page - 1) * limit;

      const [users] = await db.execute(
        `SELECT id, name, email, role, status, created_at, updated_at 
         FROM dashboard_users 
         ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [...params, parseInt(limit), offset]
      );

      const [totalResult] = await db.execute(
        `SELECT COUNT(*) as total FROM dashboard_users ${whereClause}`,
        params
      );

      return {
        users,
        total: totalResult[0].total
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const [users] = await db.execute(
        'SELECT id, name, email, role, status, created_at, updated_at FROM dashboard_users WHERE id = ?',
        [id]
      );

      return users[0] || null;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const id = uuidv4();
      const { name, email, password, role = 'support', status = 'active' } = userData;

      const hashedPassword = await bcrypt.hash(password, 10);

      await db.execute(
        `INSERT INTO dashboard_users (id, name, email, password, role, status, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, name, email, hashedPassword, role, status]
      );

      return id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(id, updateData) {
    try {
      const { name, email, role, status } = updateData;
      
      const updates = [];
      const params = [];

      if (name) {
        updates.push('name = ?');
        params.push(name);
      }

      if (email) {
        updates.push('email = ?');
        params.push(email);
      }

      if (role) {
        updates.push('role = ?');
        params.push(role);
      }

      if (status) {
        updates.push('status = ?');
        params.push(status);
      }

      if (updates.length === 0) return false;

      updates.push('updated_at = NOW()');
      params.push(id);

      const [result] = await db.execute(
        `UPDATE dashboard_users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const [result] = await db.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
