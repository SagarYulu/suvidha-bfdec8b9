
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Employee {
  static async create(employeeData) {
    const pool = getPool();
    const {
      emp_code,
      emp_name,
      emp_email,
      emp_mobile,
      designation,
      department,
      cluster_id,
      date_of_joining,
      is_active = true
    } = employeeData;
    
    const employeeId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO employees 
       (id, emp_code, emp_name, emp_email, emp_mobile, designation, 
        department, cluster_id, date_of_joining, is_active, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [employeeId, emp_code, emp_name, emp_email, emp_mobile, 
       designation, department, cluster_id, date_of_joining, is_active]
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

  static async findByEmpCode(emp_code) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT e.*, c.cluster_name, ct.city_name 
       FROM employees e
       LEFT JOIN master_clusters c ON e.cluster_id = c.id
       LEFT JOIN master_cities ct ON c.city_id = ct.id
       WHERE e.emp_code = ?`,
      [emp_code]
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
    
    if (filters.is_active !== undefined) {
      query += ' AND e.is_active = ?';
      params.push(filters.is_active);
    }
    
    if (filters.cluster_id) {
      query += ' AND e.cluster_id = ?';
      params.push(filters.cluster_id);
    }
    
    if (filters.department) {
      query += ' AND e.department = ?';
      params.push(filters.department);
    }
    
    if (filters.search) {
      query += ' AND (e.emp_name LIKE ? OR e.emp_email LIKE ? OR e.emp_code LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY e.emp_name ASC';
    
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
    const allowedFields = [
      'emp_name', 'emp_email', 'emp_mobile', 'designation', 
      'department', 'cluster_id', 'is_active'
    ];
    const fields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
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
    
    if (filters.is_active !== undefined) {
      query += ' AND is_active = ?';
      params.push(filters.is_active);
    }
    
    if (filters.cluster_id) {
      query += ' AND cluster_id = ?';
      params.push(filters.cluster_id);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }
}

module.exports = Employee;
