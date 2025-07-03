const { pool } = require('../config/db-postgres');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create({ username, password, role = 'user' }) {
    const client = await pool.connect();
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      const result = await client.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING id',
        [username, hashedPassword, role]
      );
      
      return { id: result.rows[0].id, username, role };
    } finally {
      client.release();
    }
  }

  // Find user by username
  static async findByUsername(username) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Find user by ID
  static async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  // Get all users
  static async findAll() {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM users ORDER BY created_at DESC');
      return result.rows;
    } finally {
      client.release();
    }
  }

  // Update user
  static async update(id, updates) {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = ['username', 'password', 'role'];
      
      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          if (field === 'password') {
            fields.push(`${field} = $${paramCount}`);
            values.push(bcrypt.hashSync(updates[field], 12));
          } else {
            fields.push(`${field} = $${paramCount}`);
            values.push(updates[field]);
          }
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await client.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // Delete user
  static async delete(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM users WHERE id = $1',
        [id]
      );
      return result.rowCount > 0;
    } finally {
      client.release();
    }
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;