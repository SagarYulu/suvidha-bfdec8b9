

/**
 * Check if a user has a specific role
 * @param userId User's UUID
 * @param roleName Role name to check
 * @returns Boolean indicating if user has the role
 */
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

/**
 * Assign a role to a user
 * @param userId User's UUID
 * @param roleName Role name to assign
 * @returns Boolean indicating success
 */
export const assignRole = async (userId: string, roleName: string): Promise<boolean> => {
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
    console.error('Error in assignRole:', error);
    return false;
  }
};

/**
 * Remove a role from a user
 * @param userId User's UUID
 * @param roleName Role name to remove
 * @returns Boolean indicating success
 */
export const removeRole = async (userId: string, roleName: string): Promise<boolean> => {
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
    console.error('Error in removeRole:', error);
    return false;
  }
};
