
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authService = {
  async registerUser(userData) {
    const { email, password, name, employeeId, role = 'employee', phone, city, cluster } = userData;

    // Check if user already exists
    const checkUserQuery = 'SELECT id FROM dashboard_users WHERE email = ?';
    const existingUsers = await new Promise((resolve, reject) => {
      db.query(checkUserQuery, [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (existingUsers.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const insertQuery = `
      INSERT INTO dashboard_users (name, email, employee_id, phone, city, cluster, role, password)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const result = await new Promise((resolve, reject) => {
      db.query(insertQuery, [name, email, employeeId, phone, city, cluster, role, hashedPassword], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });

    return {
      success: true,
      message: 'User created successfully',
      userId: result.insertId
    };
  },

  async loginUser(loginData) {
    const { email, password } = loginData;

    // Find user
    const query = 'SELECT * FROM dashboard_users WHERE email = ?';
    const users = await new Promise((resolve, reject) => {
      db.query(query, [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = users[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    delete user.password;

    return {
      success: true,
      token,
      user
    };
  },

  async verifyUser(userId) {
    const query = 'SELECT id, name, email, role, employee_id, phone, city, cluster FROM dashboard_users WHERE id = ?';
    const users = await new Promise((resolve, reject) => {
      db.query(query, [userId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (users.length === 0) {
      throw new Error('User not found');
    }

    return users[0];
  },

  async loginEmployee(loginData) {
    const { employeeId, password } = loginData;

    // Find employee
    const query = 'SELECT * FROM employees WHERE emp_id = ?';
    const employees = await new Promise((resolve, reject) => {
      db.query(query, [employeeId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (employees.length === 0) {
      throw new Error('Invalid credentials');
    }

    const employee = employees[0];

    // Check password (either employee ID or 'password')
    const validPassword = password === employee.emp_id || password === 'password' || 
                         await bcrypt.compare(password, employee.password);
    
    if (!validPassword) {
      throw new Error('Invalid credentials');
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: employee.id,
        email: employee.email,
        role: employee.role || 'employee',
        name: employee.name,
        employeeId: employee.emp_id
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Remove password from response
    delete employee.password;

    return {
      success: true,
      token,
      employee
    };
  }
};

module.exports = authService;
