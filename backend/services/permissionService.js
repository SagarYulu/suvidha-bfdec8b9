
const { getPool } = require('../config/database');

class PermissionService {
  /**
   * Check if user has a specific role
   */
  static async hasRole(userId, roleName) {
    const pool = getPool();
    
    try {
      const [rows] = await pool.execute(`
        SELECT 1
        FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = ?
      `, [userId, roleName]);
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Check if user has a specific permission
   */
  static async hasPermission(userId, permissionName) {
    const pool = getPool();
    
    try {
      const [rows] = await pool.execute(`
        SELECT 1
        FROM rbac_user_roles ur
        JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
        JOIN rbac_permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ? AND p.name = ?
      `, [userId, permissionName]);
      
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Get all roles for a user
   */
  static async getUserRoles(userId) {
    const pool = getPool();
    
    try {
      const [rows] = await pool.execute(`
        SELECT r.name, r.description
        FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error fetching user roles:', error);
      return [];
    }
  }

  /**
   * Get all permissions for a user
   */
  static async getUserPermissions(userId) {
    const pool = getPool();
    
    try {
      const [rows] = await pool.execute(`
        SELECT DISTINCT p.name, p.description
        FROM rbac_user_roles ur
        JOIN rbac_role_permissions rp ON ur.role_id = rp.role_id
        JOIN rbac_permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = ?
      `, [userId]);
      
      return rows;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  }

  /**
   * Assign role to user
   */
  static async assignRole(userId, roleName) {
    const pool = getPool();
    
    try {
      // Get role ID
      const [roleRows] = await pool.execute(`
        SELECT id FROM rbac_roles WHERE name = ?
      `, [roleName]);
      
      if (roleRows.length === 0) {
        throw new Error(`Role ${roleName} does not exist`);
      }
      
      const roleId = roleRows[0].id;
      
      // Insert user role
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

  /**
   * Remove role from user
   */
  static async removeRole(userId, roleName) {
    const pool = getPool();
    
    try {
      const [result] = await pool.execute(`
        DELETE ur FROM rbac_user_roles ur
        JOIN rbac_roles r ON ur.role_id = r.id
        WHERE ur.user_id = ? AND r.name = ?
      `, [userId, roleName]);
      
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  }

  /**
   * Verify special admin status
   */
  static async isSpecialAdmin(email) {
    const specialAdminEmails = [
      'admin@yulu.com',
      'sagar.km@yulu.bike',
      'superadmin@company.com'
    ];
    
    return specialAdminEmails.includes(email.toLowerCase());
  }
}

module.exports = PermissionService;
