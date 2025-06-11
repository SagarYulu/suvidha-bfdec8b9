
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
      password,
      role = 'employee',
      date_of_joining,
      date_of_birth,
      blood_group,
      account_number,
      ifsc_code,
      manager
    } = employeeData;
    
    const employeeId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO employees 
       (id, emp_name, emp_email, emp_mobile, emp_code, cluster_id, password, 
        role, date_of_joining, date_of_birth, blood_group, account_number, 
        ifsc_code, manager, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [employeeId, emp_name, emp_email, emp_mobile, emp_code, cluster_id, 
       password, role, date_of_joining, date_of_birth, blood_group, 
       account_number, ifsc_code, manager]
    );
    
    return this.findById(employeeId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, c.cluster_name, ct.city_name 
       FROM employees e
       LEFT JOIN master_clusters c ON e.cluster_id = c.id
       LEFT JOIN master_cities ct ON c.city_id = ct.id
       WHERE e.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, c.cluster_name, ct.city_name 
       FROM employees e
       LEFT JOIN master_clusters c ON e.cluster_id = c.id
       LEFT JOIN master_cities ct ON c.city_id = ct.id
       WHERE e.emp_email = ?`,
      [email]
    );
    
    return rows[0] || null;
  }

  static async findByEmpCode(empCode) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, c.cluster_name, ct.city_name 
       FROM employees e
       LEFT JOIN master_clusters c ON e.cluster_id = c.id
       LEFT JOIN master_cities ct ON c.city_id = ct.id
       WHERE e.emp_code = ?`,
      [empCode]
    );
    
    return rows[0] || null;
  }

  static async findAll(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT e.*, c.cluster_name, ct.city_name 
      FROM employees e
      LEFT JOIN master_clusters c ON e.cluster_id = c.id
      LEFT JOIN master_cities ct ON c.city_id = ct.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.cluster_id) {
      query += ' AND e.cluster_id = ?';
      params.push(filters.cluster_id);
    }
    
    if (filters.role) {
      query += ' AND e.role = ?';
      params.push(filters.role);
    }
    
    if (filters.search) {
      query += ' AND (e.emp_name LIKE ? OR e.emp_email LIKE ? OR e.emp_code LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY e.created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async update(id, updates) {
    const pool = getPool();
    const allowedFields = ['emp_name', 'emp_email', 'emp_mobile', 'cluster_id', 'role', 'manager'];
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
    const [result] = await pool.execute(
      'DELETE FROM employees WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }

  static async getCount(filters = {}) {
    const pool = getPool();
    let query = 'SELECT COUNT(*) as total FROM employees WHERE 1=1';
    const params = [];
    
    if (filters.cluster_id) {
      query += ' AND cluster_id = ?';
      params.push(filters.cluster_id);
    }
    
    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }
}

module.exports = Employee;
