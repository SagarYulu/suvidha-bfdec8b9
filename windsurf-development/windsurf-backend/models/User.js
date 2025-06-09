
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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
      'SELECT id, email, name, role, employee_id FROM dashboard_users WHERE id = ?',
      [id]
    );
    return users[0];
  }

  static async create(userData) {
    const { name, email, password, role, employee_id, phone, city, cluster, manager } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.execute(`
      INSERT INTO dashboard_users (
        id, name, email, password, role, employee_id, phone, city, cluster, manager, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [id, name, email, hashedPassword, role, employee_id, phone, city, cluster, manager]);

    return { id, name, email, role, employee_id };
  }

  static async update(id, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    await pool.execute(
      `UPDATE dashboard_users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );

    return true;
  }

  static async delete(id) {
    await pool.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);
    return true;
  }

  static async getAll(filters = {}) {
    let query = 'SELECT id, name, email, role, employee_id, city, cluster, created_at FROM dashboard_users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }

    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY created_at DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }

    if (filters.offset) {
      query += ' OFFSET ?';
      params.push(parseInt(filters.offset));
    }

    const [users] = await pool.execute(query, params);
    return users;
  }

  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
