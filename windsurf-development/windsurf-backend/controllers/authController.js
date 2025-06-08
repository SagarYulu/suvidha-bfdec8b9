
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { email, password } = req.body;

      const [users] = await pool.execute(
        'SELECT * FROM dashboard_users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        error: 'Login failed',
        message: error.message 
      });
    }
  }

  async mobileLogin(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { email, employeeId } = req.body;

      const [employees] = await pool.execute(
        'SELECT * FROM employees WHERE email = ? AND emp_id = ?',
        [email, employeeId]
      );

      if (employees.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const employee = employees[0];

      const token = jwt.sign(
        { userId: employee.id, email: employee.email, employeeId: employee.emp_id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            employeeId: employee.emp_id,
            role: employee.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Mobile login error:', error);
      res.status(500).json({ 
        error: 'Login failed',
        message: error.message 
      });
    }
  }

  async logout(req, res) {
    // In a real application, you might want to blacklist the token
    res.json({ success: true, message: 'Logged out successfully' });
  }
}

module.exports = new AuthController();
