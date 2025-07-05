const { pool } = require('../config/db');

class Employee {
  // Create a new employee
  static async create(employeeData) {
    const client = await pool.connect();
    try {
      const {
        name, email, phone, emp_id, city, cluster, manager, role, password,
        date_of_joining, blood_group, date_of_birth, account_number, ifsc_code, user_id
      } = employeeData;

      const result = await client.query(
        `INSERT INTO employees (
          name, email, phone, emp_id, city, cluster, manager, role, password,
          date_of_joining, blood_group, date_of_birth, account_number, ifsc_code, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
        [
          name, email, phone, emp_id, city, cluster, manager, role, password,
          date_of_joining, blood_group, date_of_birth, account_number, ifsc_code, user_id
        ]
      );

      return result.rows[0];
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find employee by ID
  static async findById(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM employees WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding employee by ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find employee by email
  static async findByEmail(email) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM employees WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding employee by email:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Find employee by employee ID
  static async findByEmpId(emp_id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'SELECT * FROM employees WHERE emp_id = $1',
        [emp_id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding employee by emp_id:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get all employees with optional filters
  static async findAll(filters = {}) {
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM employees WHERE 1=1';
      const values = [];
      let paramCount = 1;

      if (filters.city) {
        query += ` AND city = $${paramCount}`;
        values.push(filters.city);
        paramCount++;
      }

      if (filters.cluster) {
        query += ` AND cluster = $${paramCount}`;
        values.push(filters.cluster);
        paramCount++;
      }

      if (filters.role) {
        query += ` AND role = $${paramCount}`;
        values.push(filters.role);
        paramCount++;
      }

      if (filters.manager) {
        query += ` AND manager = $${paramCount}`;
        values.push(filters.manager);
        paramCount++;
      }

      if (filters.search) {
        query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR emp_id ILIKE $${paramCount})`;
        values.push(`%${filters.search}%`);
        paramCount++;
      }

      query += ' ORDER BY created_at DESC';

      const result = await client.query(query, values);
      return result.rows;
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Update employee
  static async update(id, updates) {
    const client = await pool.connect();
    try {
      const fields = [];
      const values = [];
      let paramCount = 1;

      const allowedFields = [
        'name', 'email', 'phone', 'emp_id', 'city', 'cluster', 'manager', 'role',
        'password', 'date_of_joining', 'blood_group', 'date_of_birth', 
        'account_number', 'ifsc_code', 'user_id'
      ];

      allowedFields.forEach(field => {
        if (updates[field] !== undefined) {
          fields.push(`${field} = $${paramCount}`);
          values.push(updates[field]);
          paramCount++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await client.query(
        `UPDATE employees SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new Error('Employee not found');
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Delete employee
  static async delete(id) {
    const client = await pool.connect();
    try {
      const result = await client.query(
        'DELETE FROM employees WHERE id = $1',
        [id]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Get employee statistics
  static async getStats() {
    const client = await pool.connect();
    try {
      // Total count
      const totalResult = await client.query('SELECT COUNT(*) as total FROM employees');
      const total = parseInt(totalResult.rows[0].total);

      // By city
      const cityResult = await client.query(
        'SELECT city, COUNT(*) as count FROM employees GROUP BY city ORDER BY count DESC'
      );

      // By cluster
      const clusterResult = await client.query(
        'SELECT cluster, COUNT(*) as count FROM employees GROUP BY cluster ORDER BY count DESC'
      );

      // By role
      const roleResult = await client.query(
        'SELECT role, COUNT(*) as count FROM employees GROUP BY role ORDER BY count DESC'
      );

      return {
        total,
        byCity: cityResult.rows,
        byCluster: clusterResult.rows,
        byRole: roleResult.rows
      };
    } catch (error) {
      console.error('Error fetching employee stats:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Employee;