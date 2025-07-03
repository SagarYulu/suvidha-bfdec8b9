const { pool } = require('../config/db-postgres');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create({ username, password, role = 'user' }) {
    const connection = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const [result] = await connection.execute(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role]
      );
      
      return { id: result.insertId, username, role };
    } finally {
      connection.release();
    }
  }

  // Find user by username
  static async findByUsername(username) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Find user by ID
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, username, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get all users
  static async findAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  // Update user
  static async update(id, updates) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];

      if (updates.username) {
        fields.push('username = ?');
        values.push(updates.username);
      }

      if (updates.password) {
        fields.push('password = ?');
        values.push(await bcrypt.hash(updates.password, 12));
      }

      if (updates.role) {
        fields.push('role = ?');
        values.push(updates.role);
      }

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);

      const [result] = await connection.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('User not found');
      }

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  // Delete user
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;