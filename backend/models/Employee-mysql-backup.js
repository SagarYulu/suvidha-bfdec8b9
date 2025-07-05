const { pool } = require('../config/db');

class Employee {
  // Create a new employee
  static async create(employeeData) {
    const connection = await pool.getConnection();
    try {
      const {
        name, email, phone, emp_id, city, cluster, manager,
        role, password, date_of_joining, blood_group, date_of_birth,
        account_number, ifsc_code, user_id
      } = employeeData;

      const [result] = await connection.execute(
        `INSERT INTO employees (
          name, email, phone, emp_id, city, cluster, manager, role, password,
          date_of_joining, blood_group, date_of_birth, account_number, ifsc_code, user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name, email, phone, emp_id, city, cluster, manager, role, password,
          date_of_joining, blood_group, date_of_birth, account_number, ifsc_code, user_id
        ]
      );

      return this.findById(result.insertId);
    } finally {
      connection.release();
    }
  }

  // Find employee by ID
  static async findById(id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM employees WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Find employee by email
  static async findByEmail(email) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM employees WHERE email = ?',
        [email]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Find employee by employee ID
  static async findByEmpId(emp_id) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM employees WHERE emp_id = ?',
        [emp_id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

  // Get all employees with optional filters
  static async findAll(filters = {}) {
    const connection = await pool.getConnection();
    try {
      let query = 'SELECT * FROM employees WHERE 1=1';
      const values = [];

      if (filters.city) {
        query += ' AND city = ?';
        values.push(filters.city);
      }

      if (filters.cluster) {
        query += ' AND cluster = ?';
        values.push(filters.cluster);
      }

      if (filters.role) {
        query += ' AND role = ?';
        values.push(filters.role);
      }

      if (filters.search) {
        query += ' AND (name LIKE ? OR email LIKE ? OR emp_id LIKE ?)';
        const searchTerm = `%${filters.search}%`;
        values.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY created_at DESC';

      const [rows] = await connection.execute(query, values);
      return rows;
    } finally {
      connection.release();
    }
  }

  // Update employee
  static async update(id, updates) {
    const connection = await pool.getConnection();
    try {
      const fields = [];
      const values = [];

      const allowedFields = [
        'name', 'email', 'phone', 'emp_id', 'city', 'cluster', 'manager',
        'role', 'password', 'date_of_joining', 'blood_group', 'date_of_birth',
        'account_number', 'ifsc_code'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          fields.push(`${field} = ?`);
          values.push(updates[field]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(id);

      const [result] = await connection.execute(
        `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        throw new Error('Employee not found');
      }

      return this.findById(id);
    } finally {
      connection.release();
    }
  }

  // Delete employee
  static async delete(id) {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        'DELETE FROM employees WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Get employee statistics
  static async getStats() {
    const connection = await pool.getConnection();
    try {
      const [totalCount] = await connection.execute(
        'SELECT COUNT(*) as total FROM employees'
      );

      const [cityStats] = await connection.execute(
        'SELECT city, COUNT(*) as count FROM employees GROUP BY city'
      );

      const [roleStats] = await connection.execute(
        'SELECT role, COUNT(*) as count FROM employees GROUP BY role'
      );

      return {
        total: totalCount[0].total,
        byCity: cityStats,
        byRole: roleStats
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = Employee;