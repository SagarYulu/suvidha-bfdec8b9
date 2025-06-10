
const db = require('../config/database');

class UserModel {
  async findByEmail(email) {
    const [users] = await db.execute(
      'SELECT * FROM dashboard_users WHERE email = ?',
      [email]
    );
    return users[0] || null;
  }

  async findById(id) {
    const [users] = await db.execute(
      'SELECT id, name, email, role, phone, department, created_at, updated_at FROM dashboard_users WHERE id = ?',
      [id]
    );
    return users[0] || null;
  }

  async create(userData) {
    const { name, email, password, role, phone, department } = userData;
    const [result] = await db.execute(
      'INSERT INTO dashboard_users (name, email, password, role, phone, department, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [name, email, password, role, phone, department]
    );
    return result.insertId;
  }

  async update(id, updates) {
    const allowedFields = ['name', 'email', 'role', 'phone', 'department'];
    const updateFields = [];
    const updateValues = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        updateValues.push(key === 'email' ? updates[key].toLowerCase() : updates[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateValues.push(id);
    await db.execute(
      `UPDATE dashboard_users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateValues
    );
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM dashboard_users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async findAll(filters = {}) {
    const { page = 1, limit = 20, search } = filters;
    
    let query = 'SELECT id, name, email, role, phone, department, created_at, updated_at FROM dashboard_users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await db.execute(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM dashboard_users WHERE 1=1';
    const countParams = [];

    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new UserModel();
