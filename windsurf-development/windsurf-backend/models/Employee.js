
const { pool } = require('../config/database');

class EmployeeModel {
  static async findByEmailAndId(email, empId) {
    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE email = ? AND emp_id = ?',
      [email, empId]
    );
    return employees[0];
  }

  static async findById(id) {
    const [employees] = await pool.execute(
      'SELECT id, emp_id, name, email, phone, city, cluster, role FROM employees WHERE id = ?',
      [id]
    );
    return employees[0];
  }

  static async getAll(filters = {}) {
    let query = 'SELECT id, emp_id, name, email, phone, city, cluster, role, created_at FROM employees WHERE 1=1';
    const params = [];

    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }

    if (filters.cluster) {
      query += ' AND cluster = ?';
      params.push(filters.cluster);
    }

    query += ' ORDER BY created_at DESC';
    const [employees] = await pool.execute(query, params);
    return employees;
  }

  static async updateProfile(id, profileData) {
    const { name, phone, city, cluster } = profileData;
    await pool.execute(
      'UPDATE employees SET name = ?, phone = ?, city = ?, cluster = ?, updated_at = NOW() WHERE id = ?',
      [name, phone, city, cluster, id]
    );
    return true;
  }
}

module.exports = EmployeeModel;
