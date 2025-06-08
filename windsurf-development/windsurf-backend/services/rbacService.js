
const db = require('../config/database');

class RBACService {
  // Check if user has role
  async hasRole(userId, roleName) {
    try {
      const query = `
        SELECT ur.id 
        FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = ?
      `;
      
      const [rows] = await db.execute(query, [userId, roleName]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }
  
  // Check if user has permission
  async hasPermission(userId, permissionName) {
    try {
      const query = `
        SELECT rp.id 
        FROM rbac_user_roles ur
        JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
        JOIN rbac_permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.name = ?
      `;
      
      const [rows] = await db.execute(query, [userId, permissionName]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }
  
  // Get user roles
  async getUserRoles(userId) {
    try {
      const query = `
        SELECT r.name, r.description 
        FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `;
      
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting user roles:', error);
      return [];
    }
  }
  
  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const query = `
        SELECT DISTINCT p.name, p.description 
        FROM rbac_user_roles ur
        JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
        JOIN rbac_permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ?
      `;
      
      const [rows] = await db.execute(query, [userId]);
      return rows;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      return [];
    }
  }
  
  // Assign role to user
  async assignRole(userId, roleName) {
    try {
      // Get role ID
      const roleQuery = 'SELECT id FROM rbac_roles WHERE name = ?';
      const [roleRows] = await db.execute(roleQuery, [roleName]);
      
      if (roleRows.length === 0) {
        throw new Error(`Role '${roleName}' not found`);
      }
      
      const roleId = roleRows[0].id;
      
      // Assign role
      const assignQuery = `
        INSERT IGNORE INTO rbac_user_roles (user_id, role_id) 
        VALUES (?, ?)
      `;
      
      await db.execute(assignQuery, [userId, roleId]);
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }
  
  // Remove role from user
  async removeRole(userId, roleName) {
    try {
      const query = `
        DELETE ur FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = ?
      `;
      
      const [result] = await db.execute(query, [userId, roleName]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }
  
  // Check if user owns resource
  async canAccessResource(userId, resourceType, resourceId) {
    try {
      switch (resourceType) {
        case 'issue':
          return await this.canAccessIssue(userId, resourceId);
        case 'comment':
          return await this.canAccessComment(userId, resourceId);
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking resource access:', error);
      return false;
    }
  }
  
  // Check if user can access issue
  async canAccessIssue(userId, issueId) {
    try {
      // Admin can access all issues
      if (await this.hasRole(userId, 'admin')) {
        return true;
      }
      
      // User can access their own issues
      const query = 'SELECT employee_uuid FROM issues WHERE id = ?';
      const [rows] = await db.execute(query, [issueId]);
      
      if (rows.length > 0) {
        return rows[0].employee_uuid === userId;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking issue access:', error);
      return false;
    }
  }
  
  // Check if user can access comment
  async canAccessComment(userId, commentId) {
    try {
      // Admin can access all comments
      if (await this.hasRole(userId, 'admin')) {
        return true;
      }
      
      // User can access their own comments or comments on their issues
      const query = `
        SELECT c.employee_uuid, i.employee_uuid as issue_owner
        FROM issue_comments c
        JOIN issues i ON c.issue_id = i.id
        WHERE c.id = ?
      `;
      
      const [rows] = await db.execute(query, [commentId]);
      
      if (rows.length > 0) {
        const comment = rows[0];
        return comment.employee_uuid === userId || comment.issue_owner === userId;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking comment access:', error);
      return false;
    }
  }
}

module.exports = new RBACService();
