
// RBAC Service Logic
// Original file: src/services/rbacService.ts

class RBACService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async hasPermission(userId, permissionName) {
    try {
      const result = await this.db.query(
        `SELECT 1 
         FROM rbac_user_roles ur
         JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
         JOIN rbac_permissions p ON rp.permission_id = p.id
         WHERE ur.user_id = ? AND p.name = ?`,
        [userId, permissionName]
      );
      
      return result && result.length > 0;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  async hasRole(userId, roleName) {
    try {
      const result = await this.db.query(
        `SELECT 1
         FROM rbac_user_roles ur
         JOIN rbac_roles r ON ur.role_id = r.id
         WHERE ur.user_id = ? AND r.name = ?`,
        [userId, roleName]
      );
      
      return result && result.length > 0;
    } catch (error) {
      console.error('Error checking role:', error);
      return false;
    }
  }

  async assignRole(userId, roleName) {
    try {
      // Get the role ID by name
      const role = await this.db.query(
        'SELECT id FROM rbac_roles WHERE name = ?',
        [roleName]
      );
      
      if (!role) {
        throw new Error(`Role ${roleName} does not exist`);
      }
      
      // Insert the user role if it doesn't exist
      await this.db.query(
        'INSERT IGNORE INTO rbac_user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())',
        [userId, role.id]
      );
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      return false;
    }
  }

  async removeRole(userId, roleName) {
    try {
      // Get the role ID by name
      const role = await this.db.query(
        'SELECT id FROM rbac_roles WHERE name = ?',
        [roleName]
      );
      
      if (!role) {
        throw new Error(`Role ${roleName} does not exist`);
      }
      
      // Delete the user-role record
      await this.db.query(
        'DELETE FROM rbac_user_roles WHERE user_id = ? AND role_id = ?',
        [userId, role.id]
      );
      
      return true;
    } catch (error) {
      console.error('Error removing role:', error);
      return false;
    }
  }

  async getUserRoles(userId) {
    try {
      const roles = await this.db.query(
        `SELECT r.name, r.description
         FROM rbac_user_roles ur
         JOIN rbac_roles r ON ur.role_id = r.id
         WHERE ur.user_id = ?`,
        [userId]
      );
      
      return roles || [];
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  async getUserPermissions(userId) {
    try {
      const permissions = await this.db.query(
        `SELECT DISTINCT p.name, p.description
         FROM rbac_user_roles ur
         JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
         JOIN rbac_permissions p ON rp.permission_id = p.id
         WHERE ur.user_id = ?`,
        [userId]
      );
      
      return permissions || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }
}

module.exports = { RBACService };
