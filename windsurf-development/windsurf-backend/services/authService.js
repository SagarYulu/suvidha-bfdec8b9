const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthService {
  // Mobile login: Email + Employee ID (matching original business logic)
  async mobileLogin(email, employeeId) {
    try {
      // Check in employee_auth_credentials table first
      const [credentials] = await db.execute(
        `SELECT eac.*, du.* FROM employee_auth_credentials eac
         JOIN dashboard_users du ON eac.user_id = du.id
         WHERE eac.email = ? AND eac.employee_id = ?`,
        [email.toLowerCase(), employeeId]
      );

      if (credentials.length > 0) {
        const user = credentials[0];
        
        // Check mobile access restrictions (matching original logic)
        const accessCheck = this.checkMobileAccess(user);
        if (!accessCheck.allowed) {
          throw new Error(accessCheck.message);
        }

        return this.generateUserResponse(user);
      }

      // Fallback to dashboard_users table
      const [users] = await db.execute(
        'SELECT * FROM dashboard_users WHERE email = ? AND employee_id = ?',
        [email.toLowerCase(), employeeId]
      );

      if (users.length === 0) {
        throw new Error('Invalid email or employee ID');
      }

      const user = users[0];
      const accessCheck = this.checkMobileAccess(user);
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.message);
      }

      return this.generateUserResponse(user);
    } catch (error) {
      console.error('Mobile login error:', error);
      throw error;
    }
  }

  // Admin login: Email + Password (unchanged)
  async adminLogin(email, password) {
    try {
      const [users] = await db.execute(
        'SELECT * FROM dashboard_users WHERE email = ?',
        [email.toLowerCase()]
      );

      if (users.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = users[0];
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      const accessCheck = this.checkAdminAccess(user);
      if (!accessCheck.allowed) {
        throw new Error(accessCheck.message);
      }

      return this.generateUserResponse(user);
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  }

  // Mobile access control logic (matching original)
  checkMobileAccess(user) {
    const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
    const dashboardUserRoles = [
      'City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head',
      'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'
    ];

    if (restrictedEmails.includes(user.email)) {
      return {
        allowed: false,
        message: "Access denied. Please use the admin dashboard."
      };
    }
    
    if (dashboardUserRoles.includes(user.role)) {
      return {
        allowed: false,
        message: "Access denied. Please use the admin dashboard."
      };
    }

    return { allowed: true };
  }

  // Admin access control logic (matching original)
  checkAdminAccess(user) {
    const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
    const dashboardUserRoles = [
      'City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head',
      'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'
    ];

    const hasAdminAccess = dashboardUserRoles.includes(user.role) || 
                          restrictedEmails.includes(user.email);

    if (!hasAdminAccess) {
      return {
        allowed: false,
        message: "Access denied. Admin privileges required."
      };
    }

    return { allowed: true };
  }

  generateUserResponse(user) {
    const token = jwt.sign(
      { 
        id: user.id || user.user_id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id || user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employee_id
      }
    };
  }
}

module.exports = new AuthService();
