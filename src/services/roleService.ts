
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

export const assignRole = async (userId: string, role: string, currentUserRole: string | null): Promise<boolean> => {
  try {
    console.log('Assigning role', { userId, role, currentUserRole });
    
    // Only admins can assign roles
    if (currentUserRole !== 'admin') {
      console.error('Only admins can assign roles');
      return false;
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

export const removeRole = async (userId: string, role: string, currentUserRole: string | null): Promise<boolean> => {
  try {
    // Only admins can remove roles
    if (currentUserRole !== 'admin') {
      console.error('Only admins can remove roles');
      return false;
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
