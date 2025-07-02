
const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const pool = getPool();
    const { email, password, full_name, role = 'employee', cluster_id } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO dashboard_users 
       (id, email, password_hash, full_name, role, cluster_id, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, email, hashedPassword, full_name, role, cluster_id, true]
    );
    
    return this.findById(userId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT u.*, c.cluster_name, c.city_id 
       FROM dashboard_users u
       LEFT JOIN master_clusters c ON u.cluster_id = c.id
       WHERE u.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT u.*, c.cluster_name, c.city_id 
       FROM dashboard_users u
       LEFT JOIN master_clusters c ON u.cluster_id = c.id
       WHERE u.email = ?`,
      [email]
    );
    
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT u.*, c.cluster_name, ct.city_name 
      FROM dashboard_users u
      LEFT JOIN master_clusters c ON u.cluster_id = c.id
      LEFT JOIN master_cities ct ON c.city_id = ct.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.role) {
      query += ' AND u.role = ?';
      params.push(filters.role);
    }
    
    if (filters.is_active !== undefined) {
      query += ' AND u.is_active = ?';
      params.push(filters.is_active);
    }
    
    if (filters.cluster_id) {
      query += ' AND u.cluster_id = ?';
      params.push(filters.cluster_id);
    }
    
    if (filters.search) {
      query += ' AND (u.full_name LIKE ? OR u.email LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updates) {
    const pool = getPool();
    const allowedFields = ['full_name', 'role', 'cluster_id', 'is_active'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    values.push(id);
    
    await pool.execute(
      `UPDATE dashboard_users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  static async updatePassword(id, newPassword) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await pool.execute(
      'UPDATE dashboard_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );
    
    return true;
  }

  static async delete(id) {
    const pool = getPool();
    const [result] = await pool.execute(
      'DELETE FROM dashboard_users WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  static async getCount(filters = {}) {
    const pool = getPool();
    let query = 'SELECT COUNT(*) as total FROM dashboard_users WHERE 1=1';
    const params = [];
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }

  static async getUserPermissions(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT DISTINCT p.permission_name, p.description
      FROM rbac_user_roles ur
      JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
      JOIN rbac_permissions p ON rp.permission_id = p.id
      WHERE ur.user_id = ?
    `, [userId]);
    
    return rows;
  }

  static async getUserRoles(userId) {
    const pool = getPool();
    const [rows] = await pool.execute(`
      SELECT r.role_name, r.description
      FROM rbac_user_roles ur
      JOIN rbac_roles r ON ur.role_id = r.id
      WHERE ur.user_id = ?
    `, [userId]);
    
    return rows;
  }
}

module.exports = User;
