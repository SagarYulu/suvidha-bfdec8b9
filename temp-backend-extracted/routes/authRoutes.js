
// Authentication Routes
// Express.js route definitions based on your authentication logic

const express = require('express');
const router = express.Router();

class AuthRoutes {
  constructor(authService, authMiddleware) {
    this.authService = authService;
    this.authMiddleware = authMiddleware;
  }

  setupRoutes() {
    // Mobile login endpoint
    router.post('/mobile/login', async (req, res) => {
      try {
        const { email, employeeId } = req.body;

        if (!email || !employeeId) {
          return res.status(400).json({
            error: 'Email and employee ID are required'
          });
        }

        console.log("Attempting mobile verification with:", { email, employeeId });
        
        // Use employeeId as password for authentication
        const user = await this.authService.login(email, employeeId);
        
        if (!user) {
          return res.status(401).json({
            error: 'Invalid email or employee ID'
          });
        }

        // Check access restrictions for mobile app
        const accessCheck = this.checkMobileAccess(user);
        if (!accessCheck.allowed) {
          return res.status(403).json({
            error: accessCheck.message
          });
        }

        // Generate JWT token
        const token = this.authMiddleware.generateToken(user);

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });

      } catch (error) {
        console.error('Mobile login error:', error);
        res.status(500).json({
          error: 'An unexpected error occurred'
        });
      }
    });

    // Admin login endpoint
    router.post('/admin/login', async (req, res) => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({
            error: 'Email and password are required'
          });
        }

        const user = await this.authService.login(email, password);
        
        if (!user) {
          return res.status(401).json({
            error: 'Invalid credentials'
          });
        }

        // Check access restrictions for admin dashboard
        const accessCheck = this.checkAdminAccess(user);
        if (!accessCheck.allowed) {
          return res.status(403).json({
            error: accessCheck.message
          });
        }

        // Generate JWT token
        const token = this.authMiddleware.generateToken(user);

        res.json({
          success: true,
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        });

      } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
          error: 'An unexpected error occurred'
        });
      }
    });

    // Logout endpoint
    router.post('/logout', this.authMiddleware.authenticateMobile.bind(this.authMiddleware), (req, res) => {
      // In a stateless JWT system, logout is handled client-side
      // You could implement token blacklisting here if needed
      res.json({ success: true, message: 'Logged out successfully' });
    });

    // Refresh token endpoint
    router.post('/refresh', async (req, res) => {
      try {
        const { token } = req.body;
        
        if (!token) {
          return res.status(400).json({ error: 'Token is required' });
        }

        const user = await this.authMiddleware.verifyToken(token);
        if (!user) {
          return res.status(401).json({ error: 'Invalid token' });
        }

        // Generate new token
        const newToken = this.authMiddleware.generateToken(user);

        res.json({
          success: true,
          token: newToken
        });

      } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
      }
    });

    return router;
  }

  checkMobileAccess(user) {
    const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
    const dashboardUserRoles = [
      'City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head',
      'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'
    ];

    // Check if user email is explicitly restricted
    if (restrictedEmails.includes(user.email)) {
      return {
        allowed: false,
        message: "Access denied. Please use the admin dashboard."
      };
    }
    
    // Check if user has a dashboard role
    if (dashboardUserRoles.includes(user.role)) {
      return {
        allowed: false,
        message: "Access denied. Please use the admin dashboard."
      };
    }

    return { allowed: true };
  }

  checkAdminAccess(user) {
    const restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
    const dashboardUserRoles = [
      'City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head',
      'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'
    ];

    // Check if user has admin access
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
}

module.exports = { AuthRoutes };
