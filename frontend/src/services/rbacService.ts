
import { ApiClient } from './apiClient';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
}

export interface UserRole {
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
}

class RBACService {
  // Role management
  async getRoles(): Promise<Role[]> {
    const response = await ApiClient.get('/api/admin/roles');
    return response.data;
  }

  async getRole(roleId: string): Promise<Role> {
    const response = await ApiClient.get(`/api/admin/roles/${roleId}`);
    return response.data;
  }

  async createRole(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const response = await ApiClient.post('/api/admin/roles', roleData);
    return response.data;
  }

  async updateRole(roleId: string, roleData: Partial<Role>): Promise<Role> {
    const response = await ApiClient.put(`/api/admin/roles/${roleId}`, roleData);
    return response.data;
  }

  async deleteRole(roleId: string): Promise<void> {
    await ApiClient.delete(`/api/admin/roles/${roleId}`);
  }

  // Permission management
  async getPermissions(): Promise<Permission[]> {
    const response = await ApiClient.get('/api/admin/permissions');
    return response.data;
  }

  async getPermissionsByCategory(): Promise<Record<string, Permission[]>> {
    const permissions = await this.getPermissions();
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }

  async createPermission(permissionData: Omit<Permission, 'id'>): Promise<Permission> {
    const response = await ApiClient.post('/api/admin/permissions', permissionData);
    return response.data;
  }

  async updatePermission(permissionId: string, permissionData: Partial<Permission>): Promise<Permission> {
    const response = await ApiClient.put(`/api/admin/permissions/${permissionId}`, permissionData);
    return response.data;
  }

  async deletePermission(permissionId: string): Promise<void> {
    await ApiClient.delete(`/api/admin/permissions/${permissionId}`);
  }

  // Role-Permission relationships
  async getRolePermissions(roleId: string): Promise<string[]> {
    const response = await ApiClient.get(`/api/admin/roles/${roleId}/permissions`);
    return response.data;
  }

  async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await ApiClient.put(`/api/admin/roles/${roleId}/permissions`, { permissions: permissionIds });
  }

  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await ApiClient.post(`/api/admin/roles/${roleId}/permissions/${permissionId}`);
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await ApiClient.delete(`/api/admin/roles/${roleId}/permissions/${permissionId}`);
  }

  // User-Role relationships
  async getUserRoles(userId: string): Promise<Role[]> {
    const response = await ApiClient.get(`/api/admin/users/${userId}/roles`);
    return response.data;
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const response = await ApiClient.get(`/api/admin/users/${userId}/permissions`);
    return response.data;
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await ApiClient.post(`/api/admin/users/${userId}/roles`, { roleId });
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await ApiClient.delete(`/api/admin/users/${userId}/roles/${roleId}`);
  }

  async updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    await ApiClient.put(`/api/admin/users/${userId}/roles`, { roles: roleIds });
  }

  // Permission checking
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const response = await ApiClient.get(`/api/admin/users/${userId}/check-permission`, {
        params: { permission }
      });
      return response.data.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  async checkCurrentUserPermission(permission: string): Promise<boolean> {
    try {
      const response = await ApiClient.get('/api/auth/check-permission', {
        params: { permission }
      });
      return response.data.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  // Audit and logging
  async getRoleAuditLog(roleId: string): Promise<any[]> {
    const response = await ApiClient.get(`/api/admin/roles/${roleId}/audit`);
    return response.data;
  }

  async getUserAccessLog(userId: string): Promise<any[]> {
    const response = await ApiClient.get(`/api/admin/users/${userId}/access-log`);
    return response.data;
  }

  async getPermissionUsageStats(): Promise<any> {
    const response = await ApiClient.get('/api/admin/permissions/usage-stats');
    return response.data;
  }

  // Bulk operations
  async bulkAssignRoles(userIds: string[], roleIds: string[]): Promise<void> {
    await ApiClient.post('/api/admin/users/bulk-assign-roles', {
      userIds,
      roleIds
    });
  }

  async bulkRemoveRoles(userIds: string[], roleIds: string[]): Promise<void> {
    await ApiClient.post('/api/admin/users/bulk-remove-roles', {
      userIds,
      roleIds
    });
  }

  // Role templates and presets
  async getRoleTemplates(): Promise<Role[]> {
    const response = await ApiClient.get('/api/admin/role-templates');
    return response.data;
  }

  async createRoleFromTemplate(templateId: string, roleName: string): Promise<Role> {
    const response = await ApiClient.post('/api/admin/roles/from-template', {
      templateId,
      name: roleName
    });
    return response.data;
  }
}

export const rbacService = new RBACService();
export default rbacService;
