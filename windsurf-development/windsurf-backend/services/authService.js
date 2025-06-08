
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthService {
  async mobileLogin(email, employeeId) {
    try {
      const [users] = await db.execute(
        'SELECT * FROM employees WHERE email = ? AND employee_id = ?',
        [email, employeeId]
      );

      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = users[0];
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          employeeId: user.employee_id
        }
      };
    } catch (error) {
      console.error('Mobile login error:', error);
      throw error;
    }
  }

  async adminLogin(email, password) {
    try {
      const [users] = await db.execute(
        'SELECT * FROM dashboard_users WHERE email = ?',
        [email]
      );

      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      };
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const [users] = await db.execute(
        'SELECT id, email, name, role FROM dashboard_users WHERE id = ?',
        [id]
      );

      return users[0] || null;
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw error;
    }
  }

  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const newToken = jwt.sign(
        { id: decoded.id, email: decoded.email, role: decoded.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { success: true, token: newToken };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, message: 'Invalid token' };
    }
  }
}

module.exports = new AuthService();
