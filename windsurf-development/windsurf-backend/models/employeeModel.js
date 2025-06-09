
const { pool } = require('../config/database');

class EmployeeModel {
  // Get all employees with filters
  async getAllEmployees(filters = {}) {
    const { city, cluster, role, search } = filters;
    
    let query = 'SELECT * FROM employees WHERE 1=1';
    const params = [];
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR emp_id LIKE ? OR email LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY name ASC';
    
    const [employees] = await pool.execute(query, params);
    return employees;
  }

  // Get employee by ID
  async getEmployeeById(id) {
    const query = 'SELECT * FROM employees WHERE id = ?';
    const [employees] = await pool.execute(query, [id]);
    return employees[0] || null;
  }

  // Get employee by employee ID
  async getEmployeeByEmpId(empId) {
    const query = 'SELECT * FROM employees WHERE emp_id = ?';
    const [employees] = await pool.execute(query, [empId]);
    return employees[0] || null;
  }

  // Get employee by email
  async getEmployeeByEmail(email) {
    const query = 'SELECT * FROM employees WHERE email = ?';
    const [employees] = await pool.execute(query, [email]);
    return employees[0] || null;
  }

  // Create new employee
  async createEmployee(employeeData) {
    const {
      empId,
      name,
      email,
      phone,
      password,
      manager,
      role,
      cluster,
      city,
      dateOfJoining,
      dateOfBirth,
      ifscCode,
      accountNumber,
      bloodGroup
    } = employeeData;

    const query = `
      INSERT INTO employees (
        emp_id, name, email, phone, password, manager, role, cluster, city,
        date_of_joining, date_of_birth, ifsc_code, account_number, blood_group,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;

    const [result] = await pool.execute(query, [
      empId, name, email, phone, password, manager, role, cluster, city,
      dateOfJoining, dateOfBirth, ifscCode, accountNumber, bloodGroup
    ]);

    return this.getEmployeeById(result.insertId);
  }

  // Update employee
  async updateEmployee(id, updateData) {
    const allowedFields = [
      'name', 'email', 'phone', 'manager', 'role', 'cluster', 'city',
      'date_of_joining', 'date_of_birth', 'ifsc_code', 'account_number', 'blood_group'
    ];
    
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    fields.push('updated_at = NOW()');
    values.push(id);

    const query = `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    return this.getEmployeeById(id);
  }

  // Delete employee
  async deleteEmployee(id) {
    const query = 'DELETE FROM employees WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get unique cities
  async getCities() {
    const query = 'SELECT DISTINCT city FROM employees WHERE city IS NOT NULL ORDER BY city';
    const [cities] = await pool.execute(query);
    return cities.map(row => row.city);
  }

  // Get unique clusters
  async getClusters() {
    const query = 'SELECT DISTINCT cluster FROM employees WHERE cluster IS NOT NULL ORDER BY cluster';
    const [clusters] = await pool.execute(query);
    return clusters.map(row => row.cluster);
  }

  // Get unique roles
  async getRoles() {
    const query = 'SELECT DISTINCT role FROM employees WHERE role IS NOT NULL ORDER BY role';
    const [roles] = await pool.execute(query);
    return roles.map(row => row.role);
  }

  // Get employee statistics
  async getEmployeeStats() {
    const query = `
      SELECT 
        COUNT(*) as total_employees,
        COUNT(DISTINCT city) as cities_count,
        COUNT(DISTINCT cluster) as clusters_count,
        COUNT(DISTINCT role) as roles_count
      FROM employees
    `;

    const [stats] = await pool.execute(query);
    return stats[0];
  }
}

module.exports = new EmployeeModel();
