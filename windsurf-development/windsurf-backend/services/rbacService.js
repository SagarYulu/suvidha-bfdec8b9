
const { pool } = require('../config/database');

class RBACService {
  async userHasRole(userId, roleName) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM dashboard_users du
        WHERE du.id = ? AND du.role = ?
      `;
      
      const [result] = await pool.execute(query, [userId, roleName]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  async userHasAnyRole(userId, roles) {
    try {
      const placeholders = roles.map(() => '?').join(',');
      const query = `
        SELECT COUNT(*) as count
        FROM dashboard_users du
        WHERE du.id = ? AND du.role IN (${placeholders})
      `;
      
      const [result] = await pool.execute(query, [userId, ...roles]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking user roles:', error);
      return false;
    }
  }

  async userHasPermission(userId, permission) {
    try {
      // In this simplified RBAC, we'll check based on roles
      const rolePermissions = {
        'admin': ['*'], // Admin has all permissions
        'manager': ['issues:read', 'issues:update', 'issues:assign', 'users:read', 'reports:read'],
        'agent': ['issues:read', 'issues:update', 'issues:comment'],
        'recruiter': ['issues:read', 'issues:create', 'users:read'],
        'crm': ['issues:read', 'issues:create', 'users:read'],
        'trainer': ['issues:read', 'users:read'],
        'employee': ['issues:read', 'issues:create']
      };

      const query = 'SELECT role FROM dashboard_users WHERE id = ?';
      const [result] = await pool.execute(query, [userId]);
      
      if (result.length === 0) {
        return false;
      }

      const userRole = result[0].role;
      const permissions = rolePermissions[userRole] || [];
      
      return permissions.includes('*') || permissions.includes(permission);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  async userHasAnyPermission(userId, permissions) {
    for (const permission of permissions) {
      if (await this.userHasPermission(userId, permission)) {
        return true;
      }
    }
    return false;
  }

  async checkResourceOwnership(userId, resourceType, resourceId) {
    try {
      let query;
      
      switch (resourceType) {
        case 'issue':
          query = 'SELECT COUNT(*) as count FROM issues WHERE id = ? AND employee_uuid = ?';
          break;
        case 'feedback':
          query = 'SELECT COUNT(*) as count FROM ticket_feedback WHERE id = ? AND employee_uuid = ?';
          break;
        default:
          return false;
      }

      const [result] = await pool.execute(query, [resourceId, userId]);
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking resource ownership:', error);
      return false;
    }
  }

  async getUserRoles(userId) {
    try {
      const query = 'SELECT role FROM dashboard_users WHERE id = ?';
      const [result] = await pool.execute(query, [userId]);
      
      return result.length > 0 ? [result[0].role] : [];
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }

  async getUserPermissions(userId) {
    try {
      const roles = await this.getUserRoles(userId);
      const allPermissions = new Set();

      const rolePermissions = {
        'admin': ['*'],
        'manager': ['issues:read', 'issues:update', 'issues:assign', 'users:read', 'reports:read'],
        'agent': ['issues:read', 'issues:update', 'issues:comment'],
        'recruiter': ['issues:read', 'issues:create', 'users:read'],
        'crm': ['issues:read', 'issues:create', 'users:read'],
        'trainer': ['issues:read', 'users:read'],
        'employee': ['issues:read', 'issues:create']
      };

      roles.forEach(role => {
        const permissions = rolePermissions[role] || [];
        permissions.forEach(permission => allPermissions.add(permission));
      });

      return Array.from(allPermissions);
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }
}

module.exports = new RBACService();
