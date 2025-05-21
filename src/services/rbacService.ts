
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

// Export new helper function to ensure permissions exist in the database
export const ensurePermissionsExist = async (): Promise<void> => {
  try {
    // List of all expected permissions
    const requiredPermissions = [
      { name: 'view:dashboard', description: 'Access to view the admin dashboard' },
      { name: 'manage:users', description: 'Access to manage users' },
      { name: 'manage:issues', description: 'Access to manage issues' },
      { name: 'manage:analytics', description: 'Access to view analytics' },
      { name: 'manage:settings', description: 'Access to change settings' },
      { name: 'access:security', description: 'Access to security features' },
      { name: 'create:dashboardUser', description: 'Permission to create dashboard users' },
      { name: 'view:assigned_issues', description: 'Permission to view assigned issues' },
      { name: 'view:feedback', description: 'Permission to view feedback analytics' },
      { name: 'view:resolution', description: 'Permission to view resolution feedback' }
    ];
    
    // Force refresh the database with all required permissions
    console.log('Ensuring all required permissions exist in the database...');
    
    for (const perm of requiredPermissions) {
      console.log(`Checking permission: ${perm.name}`);
      
      // Check if permission exists
      const { data: existingPerm, error: checkError } = await supabase
        .from('rbac_permissions')
        .select('id')
        .eq('name', perm.name)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // Not found error
        console.error(`Error checking for permission ${perm.name}:`, checkError);
        continue;
      }
      
      if (!existingPerm) {
        console.log(`Creating permission: ${perm.name}`);
        
        // Insert the permission
        const { error: insertError } = await supabase
          .from('rbac_permissions')
          .insert({
            name: perm.name,
            description: perm.description
          });
        
        if (insertError) {
          console.error(`Error creating permission ${perm.name}:`, insertError);
        } else {
          console.log(`Permission ${perm.name} created successfully`);
        }
      } else {
        console.log(`Permission ${perm.name} already exists`);
        
        // Update the description if needed
        const { error: updateError } = await supabase
          .from('rbac_permissions')
          .update({ description: perm.description })
          .eq('id', existingPerm.id);
        
        if (updateError) {
          console.error(`Error updating permission ${perm.name}:`, updateError);
        }
      }
    }
    
    console.log('Permission synchronization complete');
  } catch (error) {
    console.error('Error in ensurePermissionsExist:', error);
    throw error;
  }
};
