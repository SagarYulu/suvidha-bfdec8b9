
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthService {
  async authenticateUser(email, password) {
    try {
      // Check dashboard_users table first
      const [dashboardUsers] = await db.execute(
        'SELECT id, email, password, role, name, employee_id FROM dashboard_users WHERE email = ?',
        [email]
      );

      if (dashboardUsers.length > 0) {
        const user = dashboardUsers[0];
        const isValidPassword = await bcrypt.compare(password, user.password);
        
        if (isValidPassword) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            employee_id: user.employee_id,
            userType: 'dashboard_user'
          };
        }
      }

      // Check employees table for mobile users
      const [employees] = await db.execute(
        'SELECT id, email, name, employee_id FROM employees WHERE email = ? AND employee_id = ?',
        [email, password]
      );

      if (employees.length > 0) {
        const employee = employees[0];
        return {
          id: employee.id,
          email: employee.email,
          name: employee.name,
          employee_id: employee.employee_id,
          role: 'employee',
          userType: 'employee'
        };
      }

      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        userType: user.userType 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (error) {
      return null;
    }
  }

  async getUserById(id, userType) {
    try {
      if (userType === 'dashboard_user') {
        const [users] = await db.execute(
          'SELECT id, email, role, name, employee_id FROM dashboard_users WHERE id = ?',
          [id]
        );
        return users[0] || null;
      } else {
        const [employees] = await db.execute(
          'SELECT id, email, name, employee_id FROM employees WHERE id = ?',
          [id]
        );
        return employees[0] || null;
      }
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async createEmployee(employeeData) {
    try {
      const { name, email, employee_id, phone, department } = employeeData;
      const id = require('uuid').v4();

      await db.execute(`
        INSERT INTO employees (id, name, email, employee_id, phone, department, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [id, name, email, employee_id, phone, department]);

      return id;
    } catch (error) {
      console.error('Create employee error:', error);
      throw error;
    }
  }

  async createDashboardUser(userData) {
    try {
      const { name, email, password, role, employee_id } = userData;
      const id = require('uuid').v4();
      const hashedPassword = await bcrypt.hash(password, 10);

      await db.execute(`
        INSERT INTO dashboard_users (id, name, email, password, role, employee_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [id, name, email, hashedPassword, role, employee_id]);

      return id;
    } catch (error) {
      console.error('Create dashboard user error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
