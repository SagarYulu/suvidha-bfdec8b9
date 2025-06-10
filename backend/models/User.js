const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const PermissionService = require('../services/permissionService');
const WorkingTimeUtils = require('../utils/workingTimeUtils');

class User {
  static async create(userData) {
    const pool = getPool();
    const { email, password, full_name, role = 'employee', cluster_id } = userData;
    
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO dashboard_users 
       (id, email, password, name, role, cluster, city, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, email, hashedPassword, full_name, role, cluster_id || null, userData.city || null]
    );
    
    return this.findById(userId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT u.*, c.cluster_name, c.city_id 
       FROM dashboard_users u
       LEFT JOIN master_clusters c ON u.cluster = c.name
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
       LEFT JOIN master_clusters c ON u.cluster = c.name
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
      LEFT JOIN master_clusters c ON u.cluster = c.name
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
      query += ' AND u.cluster = ?';
      params.push(filters.cluster_id);
    }
    
    if (filters.search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
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
    const allowedFields = ['name', 'role', 'cluster', 'city', 'phone', 'manager'];
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
      'UPDATE dashboard_users SET password = ?, updated_at = NOW() WHERE id = ?',
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
    return await PermissionService.getUserPermissions(userId);
  }

  static async getUserRoles(userId) {
    return await PermissionService.getUserRoles(userId);
  }

  static async hasRole(userId, roleName) {
    return await PermissionService.hasRole(userId, roleName);
  }

  static async hasPermission(userId, permissionName) {
    return await PermissionService.hasPermission(userId, permissionName);
  }
}

module.exports = User;
