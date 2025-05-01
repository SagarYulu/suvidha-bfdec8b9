
import { supabase } from "@/integrations/supabase/client";

export interface Role {
  id: string;
  name: string;
  description: string | null;
}

export interface Permission {
  id: string;
  name: string;
  description: string | null;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
}

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('rbac_roles')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
  
  return data || [];
};

// Get all permissions
export const getPermissions = async (): Promise<Permission[]> => {
  const { data, error } = await supabase
    .from('rbac_permissions')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
  
  return data || [];
};

// Get permissions for a specific role
export const getPermissionsForRole = async (roleId: string): Promise<Permission[]> => {
  const { data, error } = await supabase
    .from('rbac_role_permissions')
    .select('permission_id')
    .eq('role_id', roleId);
  
  if (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  const permissionIds = data.map(rp => rp.permission_id);
  
  const { data: permissions, error: permError } = await supabase
    .from('rbac_permissions')
    .select('*')
    .in('id', permissionIds);
  
  if (permError) {
    console.error('Error fetching permissions by IDs:', permError);
    throw permError;
  }
  
  return permissions || [];
};

// Get roles for a specific user
export const getRolesForUser = async (userId: string): Promise<Role[]> => {
  const { data, error } = await supabase
    .from('rbac_user_roles')
    .select('role_id')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user roles:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    return [];
  }
  
  const roleIds = data.map(ur => ur.role_id);
  
  const { data: roles, error: roleError } = await supabase
    .from('rbac_roles')
    .select('*')
    .in('id', roleIds);
  
  if (roleError) {
    console.error('Error fetching roles by IDs:', roleError);
    throw roleError;
  }
  
  return roles || [];
};

// Check if user has a specific permission
export const checkUserPermission = async (userId: string, permissionName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_permission', {
      user_id: userId,
      permission_name: permissionName
    });
    
    if (error) {
      console.error('Error checking permission:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in checkUserPermission:', error);
    return false;
  }
};

// Assign a permission to a role
export const assignPermissionToRole = async (roleName: string, permissionName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('assign_permission_to_role', {
      role_name: roleName,
      permission_name: permissionName
    });
    
    if (error) {
      console.error('Error assigning permission to role:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in assignPermissionToRole:', error);
    return false;
  }
};

// Remove a permission from a role
export const removePermissionFromRole = async (roleName: string, permissionName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('remove_permission_from_role', {
      role_name: roleName,
      permission_name: permissionName
    });
    
    if (error) {
      console.error('Error removing permission from role:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in removePermissionFromRole:', error);
    return false;
  }
};

// Assign a role to a user
export const assignRoleToUser = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('assign_role', {
      target_user_id: userId,
      role_name: roleName
    });
    
    if (error) {
      console.error('Error assigning role to user:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in assignRoleToUser:', error);
    return false;
  }
};

// Remove a role from a user
export const removeRoleFromUser = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('remove_role', {
      target_user_id: userId,
      role_name: roleName
    });
    
    if (error) {
      console.error('Error removing role from user:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in removeRoleFromUser:', error);
    return false;
  }
};

// Check if a user has a specific role
export const checkUserRole = async (userId: string, roleName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      user_id: userId,
      role_name: roleName
    });
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return data === true;
  } catch (error) {
    console.error('Error in checkUserRole:', error);
    return false;
  }
};
