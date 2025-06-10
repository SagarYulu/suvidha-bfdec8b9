
// Authentication Middleware
// Based on your mobile authentication logic

class AuthMiddleware {
  constructor(authService, rbacService) {
    this.authService = authService;
    this.rbacService = rbacService;
    
    // Dashboard user roles that should be redirected to admin dashboard
    this.dashboardUserRoles = [
      'City Head', 'Revenue and Ops Head', 'CRM', 'Cluster Head', 
      'Payroll Ops', 'HR Admin', 'Super Admin', 'security-admin', 'admin'
    ];
    
    // Restricted emails that should never access mobile app
    this.restrictedEmails = ['sagar.km@yulu.bike', 'admin@yulu.com'];
  }

  // Middleware for mobile app authentication
  async authenticateMobile(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No authentication token provided' });
      }

      // Verify token and get user
      const user = await this.verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }

      // Check if user email is explicitly restricted
      if (this.restrictedEmails.includes(user.email)) {
        console.log("Restricted email detected:", user.email);
        return res.status(403).json({ 
          error: "Access denied. Please use the admin dashboard." 
        });
      }
      
      // Check if user has a dashboard role
      if (this.dashboardUserRoles.includes(user.role)) {
        console.log("Dashboard role detected:", user.role);
        return res.status(403).json({ 
          error: "Access denied. Please use the admin dashboard." 
        });
      }

      // User is authorized for mobile access
      req.user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Middleware for admin dashboard authentication
  async authenticateAdmin(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({ error: 'No authentication token provided' });
      }

      // Verify token and get user
      const user = await this.verifyToken(token);
      if (!user) {
        return res.status(401).json({ error: 'Invalid authentication token' });
      }

      // Check if user has admin access
      const hasAdminAccess = this.dashboardUserRoles.includes(user.role) || 
                            this.restrictedEmails.includes(user.email);

      if (!hasAdminAccess) {
        return res.status(403).json({ 
          error: "Access denied. Admin privileges required." 
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Admin authentication error:', error);
      return res.status(500).json({ error: 'Authentication failed' });
    }
  }

  // Role-based access control middleware
  requirePermission(permission) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasPermission = await this.rbacService.hasPermission(req.user.id, permission);
        
        if (!hasPermission) {
          return res.status(403).json({ 
            error: `Permission required: ${permission}` 
          });
        }

        next();
      } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({ error: 'Permission check failed' });
      }
    };
  }

  // Role-based access control middleware
  requireRole(role) {
    return async (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: 'Authentication required' });
        }

        const hasRole = await this.rbacService.hasRole(req.user.id, role);
        
        if (!hasRole) {
          return res.status(403).json({ 
            error: `Role required: ${role}` 
          });
        }

        next();
      } catch (error) {
        console.error('Role check error:', error);
        return res.status(500).json({ error: 'Role check failed' });
      }
    };
  }

  async verifyToken(token) {
    try {
      // Implement your JWT verification logic here
      // This should decode the token and return the user object
      // For now, this is a placeholder
      
      // You'll need to implement JWT verification based on your token strategy
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  generateToken(user) {
    // Implement JWT token generation
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
  }
}

module.exports = { AuthMiddleware };
