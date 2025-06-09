
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  static async findByEmail(email) {
    const [users] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE email = ?',
      [email]
    );
    return users[0];
  }

  static async findById(id) {
    const [users] = await pool.execute(
      'SELECT id, name, email, role, employee_id, phone, city, cluster, manager, created_at, updated_at FROM dashboard_users WHERE id = ?',
      [id]
    );
    return users[0];
  }

  static async create(userData) {
    const { name, email, password, role, employee_id, phone, city, cluster, manager } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    const id = require('uuid').v4();

    await pool.execute(`
      INSERT INTO dashboard_users (id, name, email, password, role, employee_id, phone, city, cluster, manager, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [id, name, email, hashedPassword, role, employee_id, phone, city, cluster, manager]);

    return this.findById(id);
  }

  static async update(id, updateData) {
    const { name, email, role, employee_id, phone, city, cluster, manager } = updateData;
    
    await pool.execute(`
      UPDATE dashboard_users 
      SET name = ?, email = ?, role = ?, employee_id = ?, phone = ?, city = ?, cluster = ?, manager = ?, updated_at = NOW()
      WHERE id = ?
    `, [name, email, role, employee_id, phone, city, cluster, manager, id]);

    return this.findById(id);
  }

  static async delete(id) {
    await pool.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);
    return true;
  }

  static async getAll(filters = {}) {
    let query = 'SELECT id, name, email, role, employee_id, phone, city, cluster, manager, created_at FROM dashboard_users WHERE 1=1';
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
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    const [users] = await pool.execute(query, params);
    return users;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await pool.execute(
      'UPDATE dashboard_users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );
    return true;
  }
}

module.exports = UserModel;
