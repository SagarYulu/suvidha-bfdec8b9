
const { getPool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create(userData) {
    const pool = getPool();
    const {
      full_name,
      email,
      password,
      role = 'employee',
      city,
      cluster,
      phone,
      employee_id,
      cluster_id
    } = userData;
    
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const [result] = await pool.execute(
      `INSERT INTO dashboard_users 
       (id, full_name, email, password_hash, role, city, cluster, phone, employee_id, cluster_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, full_name, email, hashedPassword, role, city, cluster, phone, employee_id, cluster_id]
    );
    
    return this.findById(userId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT id, full_name, email, role, city, cluster, phone, employee_id, cluster_id, is_active, created_at, updated_at FROM dashboard_users WHERE id = ?',
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE email = ?',
      [email]
    );
    
    return rows[0] || null;
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async updatePassword(userId, newPassword) {
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await pool.execute(
      'UPDATE dashboard_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, userId]
    );
  }

  static async getUserPermissions(userId) {
    // For now, return basic permissions based on role
    const user = await this.findById(userId);
    if (!user) return [];
    
    const rolePermissions = {
      admin: ['create_issues', 'view_all_issues', 'assign_issues', 'escalate_issues', 'manage_users'],
      manager: ['create_issues', 'view_team_issues', 'assign_issues', 'escalate_issues'],
      agent: ['create_issues', 'view_assigned_issues', 'update_issues'],
      employee: ['create_issues', 'view_own_issues']
    };
    
    return rolePermissions[user.role] || [];
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT id, full_name, email, role, city, cluster, phone, employee_id, cluster_id, is_active, created_at FROM dashboard_users WHERE 1=1';
    const params = [];
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updates) {
    const pool = getPool();
    const allowedFields = ['full_name', 'email', 'role', 'city', 'cluster', 'phone', 'is_active'];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key) && updates[key] !== undefined) {
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
}

module.exports = User;
