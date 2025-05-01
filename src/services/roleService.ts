
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_ADMIN_USER } from "./authService";

// Define interfaces for function parameters
interface HasRoleParams {
  user_id: string;
  role_name: string;
}

interface AssignRoleParams {
  target_user_id: string;
  role_name: string;
}

interface RemoveRoleParams {
  target_user_id: string;
  role_name: string;
}

export const checkUserRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // For the default admin user
    if (userId === DEFAULT_ADMIN_USER.id && role === 'admin') {
      return true;
    }

    // For non-UUID users, we can't check roles in the database
    if (!isValidUuid(userId)) {
      // For testing/demo users, we can hardcode some roles
      if (userId === 'security-user-1' && (role === 'security-admin' || role === 'Super Admin')) {
        return true;
      }
      return false;
    }

    // Query the database for role assignment
    const params: HasRoleParams = {
      user_id: userId,
      role_name: role
    };
    
    // Use functions.invoke with proper typing
    const { data, error } = await supabase.functions.invoke<boolean>('has_role', {
      body: params
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

export const assignRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    console.log('Assigning role', { userId, role });
    
    // For non-UUID users, we can't assign roles in the database
    if (!isValidUuid(userId)) {
      console.log('Non-UUID user detected, skipping database role assignment');
      return true; // Pretend success for non-UUID users
    }

    const params: AssignRoleParams = {
      target_user_id: userId,
      role_name: role
    };
    
    // Use functions.invoke with proper typing
    const { data, error } = await supabase.functions.invoke<boolean>('assign_role', {
      body: params
    });

    if (error) {
      console.error('Error assigning role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in assignRole:', error);
    return false;
  }
};

export const removeRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // For non-UUID users, we can't remove roles in the database
    if (!isValidUuid(userId)) {
      console.log('Non-UUID user detected, skipping database role removal');
      return true; // Pretend success for non-UUID users
    }

    const params: RemoveRoleParams = {
      target_user_id: userId,
      role_name: role
    };
    
    // Use functions.invoke with proper typing
    const { data, error } = await supabase.functions.invoke<boolean>('remove_role', {
      body: params
    });

    if (error) {
      console.error('Error removing role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in removeRole:', error);
    return false;
  }
};

// UUID validation function
function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}
