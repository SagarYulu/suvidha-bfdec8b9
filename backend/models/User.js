
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
    const password_hash = await bcrypt.hash(password, 12);
    
    const [result] = await pool.execute(
      `INSERT INTO dashboard_users 
       (id, full_name, email, password_hash, role, city, cluster, phone, employee_id, cluster_id, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [userId, full_name, email, password_hash, role, city, cluster, phone, employee_id, cluster_id]
    );
    
    return this.findById(userId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE id = ? AND is_active = true',
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE email = ? AND is_active = true',
      [email]
    );
    
    return rows[0] || null;
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const pool = getPool();
    const password_hash = await bcrypt.hash(newPassword, 12);
    
    await pool.execute(
      'UPDATE dashboard_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, id]
    );
  }

  static async getUserPermissions(userId) {
    const user = await this.findById(userId);
    if (!user) return [];
    
    // Define role-based permissions
    const rolePermissions = {
      admin: ['*'], // All permissions
      manager: ['read_issues', 'write_issues', 'manage_employees', 'view_analytics', 'escalate_issues'],
      agent: ['read_issues', 'write_issues', 'update_issues'],
      employee: ['read_own_issues', 'create_issues']
    };
    
    return rolePermissions[user.role] || [];
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT id, full_name, email, role, city, cluster, phone, employee_id, is_active, created_at FROM dashboard_users WHERE 1=1';
    const params = [];
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }
    
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updates) {
    const pool = getPool();
    const allowedFields = ['full_name', 'email', 'role', 'city', 'cluster', 'phone', 'employee_id', 'cluster_id', 'is_active'];
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

  static async delete(id) {
    const pool = getPool();
    // Soft delete by setting is_active to false
    await pool.execute(
      'UPDATE dashboard_users SET is_active = false, updated_at = NOW() WHERE id = ?',
      [id]
    );
  }
}

module.exports = User;
