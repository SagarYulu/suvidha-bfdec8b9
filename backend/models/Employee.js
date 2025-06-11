
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Employee {
  static async create(employeeData) {
    const pool = getPool();
    const {
      emp_name,
      emp_email,
      emp_mobile,
      emp_code,
      cluster_id,
      role = 'employee',
      date_of_joining,
      date_of_birth,
      blood_group,
      account_number,
      ifsc_code,
      manager,
      city,
      cluster
    } = employeeData;
    
    const employeeId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO employees 
       (id, emp_name, emp_email, emp_mobile, emp_code, cluster_id, role, 
        date_of_joining, date_of_birth, blood_group, account_number, ifsc_code, 
        manager, city, cluster, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [employeeId, emp_name, emp_email, emp_mobile, emp_code, cluster_id, role,
       date_of_joining, date_of_birth, blood_group, account_number, ifsc_code,
       manager, city, cluster]
    );
    
    return this.findById(employeeId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM employees WHERE id = ?',
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM employees WHERE emp_email = ?',
      [email]
    );
    
    return rows[0] || null;
  }

  static async findByCode(emp_code) {
    const pool = getPool();
    const [rows] = await pool.execute(
      'SELECT * FROM employees WHERE emp_code = ?',
      [emp_code]
    );
    
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    
    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }
    
    if (filters.cluster) {
      query += ' AND cluster = ?';
      params.push(filters.cluster);
    }
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
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
    const allowedFields = [
      'emp_name', 'emp_email', 'emp_mobile', 'cluster_id', 'role',
      'date_of_joining', 'date_of_birth', 'blood_group', 'account_number',
      'ifsc_code', 'manager', 'city', 'cluster'
    ];
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
      `UPDATE employees SET ${fields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      values
    );
    
    return this.findById(id);
  }

  static async delete(id) {
    const pool = getPool();
    await pool.execute('DELETE FROM employees WHERE id = ?', [id]);
  }

  static async getCount() {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT COUNT(*) as count FROM employees');
    return rows[0].count;
  }
}

module.exports = Employee;
