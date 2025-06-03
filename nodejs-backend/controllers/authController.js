
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const queries = require('../queries/authQueries');

const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in dashboard_users
    const [users] = await pool.execute(queries.findUserByEmail, [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const employeeLogin = async (req, res) => {
  try {
    const { employeeId, password } = req.body;

    // Check if employee exists
    const [employees] = await pool.execute(queries.findEmployeeById, [employeeId]);

    if (employees.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const employee = employees[0];

    // Check password (either hashed password or employee ID)
    let isValidPassword = false;
    if (employee.password.startsWith('$2')) {
      // Hashed password
      isValidPassword = await bcrypt.compare(password, employee.password);
    } else {
      // Plain text password or employee ID
      isValidPassword = password === employee.password || password === employee.emp_id;
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = generateToken(employee.id, employee.email, employee.role || 'employee');

    res.json({
      success: true,
      token,
      employee: {
        uuid: employee.id,
        name: employee.name,
        employeeId: employee.emp_id,
        manager: employee.manager
      }
    });
  } catch (error) {
    console.error('Employee login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    // Token is already verified by middleware, just return user info
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const logout = (req, res) => {
  // Since we're using stateless JWT, logout is handled client-side
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  adminLogin,
  employeeLogin,
  verifyToken,
  logout
};
