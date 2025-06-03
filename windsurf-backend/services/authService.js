const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const authService = {
  async registerUser(userData) {
    const { email, password, name, role = 'employee' } = userData;

    // Check if email already exists
    const [existingUsers] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      throw new Error('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await pool.execute(
      'INSERT INTO dashboard_users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    return {
      id: userId,
      email,
      name,
      role,
      message: 'User registered successfully'
    };
  },

  async loginUser(loginData) {
    const { email, password } = loginData;

    // Get user from database
    const [users] = await pool.execute(
      'SELECT * FROM dashboard_users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      message: 'Login successful'
    };
  },

  async verifyUser(userId) {
    const [users] = await pool.execute(
      'SELECT id, email, name, role FROM dashboard_users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  },

  async loginEmployee(loginData) {
    const { employeeId, password } = loginData;

    // Get employee from database
    const [employees] = await pool.execute(
      'SELECT * FROM employees WHERE employee_id = ?',
      [employeeId]
    );

    if (employees.length === 0) {
      throw new Error('Invalid credentials');
    }

    const employee = employees[0];

    // For simplicity, check if the password matches the employeeId
    if (password !== employee.employee_id) {
      throw new Error('Invalid credentials');
    }

    return {
      id: employee.employee_uuid,
      employeeId: employee.employee_id,
      name: employee.employee_name,
      email: employee.employee_email,
      message: 'Employee login successful'
    };
  }
};

module.exports = authService;
