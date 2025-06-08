
const { pool } = require('../config/database');

class RBACService {
  // Get user roles
  async getUserRoles(userId) {
    try {
      const [roles] = await pool.execute(`
        SELECT r.id, r.name, r.description
        FROM rbac_roles r
        JOIN rbac_user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ?
      `, [userId]);
      
      return roles;
    } catch (error) {
      console.error('Error getting user roles:', error);
      throw error;
    }
  }

  // Get user permissions
  async getUserPermissions(userId) {
    try {
      const [permissions] = await pool.execute(`
        SELECT DISTINCT p.id, p.name, p.description
        FROM rbac_permissions p
        JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        JOIN rbac_user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ?
      `, [userId]);
      
      return permissions;
    } catch (error) {
      console.error('Error getting user permissions:', error);
      throw error;
    }
  }

  // Check if user has specific permission
  async userHasPermission(userId, permissionName) {
    try {
      const [result] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM rbac_permissions p
        JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        JOIN rbac_user_roles ur ON rp.role_id = ur.role_id
        WHERE ur.user_id = ? AND p.name = ?
      `, [userId, permissionName]);
      
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking user permission:', error);
      throw error;
    }
  }

  // Check if user has specific role
  async userHasRole(userId, roleName) {
    try {
      const [result] = await pool.execute(`
        SELECT COUNT(*) as count
        FROM rbac_roles r
        JOIN rbac_user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = ? AND r.name = ?
      `, [userId, roleName]);
      
      return result[0].count > 0;
    } catch (error) {
      console.error('Error checking user role:', error);
      throw error;
    }
  }

  // Assign role to user
  async assignRole(userId, roleId) {
    try {
      await pool.execute(`
        INSERT INTO rbac_user_roles (user_id, role_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE user_id = user_id
      `, [userId, roleId]);
      
      return true;
    } catch (error) {
      console.error('Error assigning role:', error);
      throw error;
    }
  }

  // Remove role from user
  async removeRole(userId, roleId) {
    try {
      const [result] = await pool.execute(`
        DELETE FROM rbac_user_roles
        WHERE user_id = ? AND role_id = ?
      `, [userId, roleId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }

  // Get all roles
  async getAllRoles() {
    try {
      const [roles] = await pool.execute(`
        SELECT id, name, description, created_at, updated_at
        FROM rbac_roles
        ORDER BY name
      `);
      
      return roles;
    } catch (error) {
      console.error('Error getting all roles:', error);
      throw error;
    }
  }

  // Get all permissions
  async getAllPermissions() {
    try {
      const [permissions] = await pool.execute(`
        SELECT id, name, description, created_at, updated_at
        FROM rbac_permissions
        ORDER BY name
      `);
      
      return permissions;
    } catch (error) {
      console.error('Error getting all permissions:', error);
      throw error;
    }
  }

  // Get role permissions
  async getRolePermissions(roleId) {
    try {
      const [permissions] = await pool.execute(`
        SELECT p.id, p.name, p.description
        FROM rbac_permissions p
        JOIN rbac_role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ?
      `, [roleId]);
      
      return permissions;
    } catch (error) {
      console.error('Error getting role permissions:', error);
      throw error;
    }
  }

  // Assign permission to role
  async assignPermissionToRole(roleId, permissionId) {
    try {
      await pool.execute(`
        INSERT INTO rbac_role_permissions (role_id, permission_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE role_id = role_id
      `, [roleId, permissionId]);
      
      return true;
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      throw error;
    }
  }

  // Remove permission from role
  async removePermissionFromRole(roleId, permissionId) {
    try {
      const [result] = await pool.execute(`
        DELETE FROM rbac_role_permissions
        WHERE role_id = ? AND permission_id = ?
      `, [roleId, permissionId]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing permission from role:', error);
      throw error;
    }
  }

  // Create new role
  async createRole(name, description) {
    try {
      const [result] = await pool.execute(`
        INSERT INTO rbac_roles (name, description)
        VALUES (?, ?)
      `, [name, description]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  // Create new permission
  async createPermission(name, description) {
    try {
      const [result] = await pool.execute(`
        INSERT INTO rbac_permissions (name, description)
        VALUES (?, ?)
      `, [name, description]);
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating permission:', error);
      throw error;
    }
  }
}

module.exports = new RBACService();
