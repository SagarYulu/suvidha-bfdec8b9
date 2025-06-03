
import { mockSupabase as supabase } from '@/lib/mockSupabase';

export const getRoles = async () => {
  try {
    const { data, error } = await supabase.from('rbac_roles').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const getPermissions = async () => {
  try {
    const { data, error } = await supabase.from('rbac_permissions').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return [];
  }
};

export const getUserRoles = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('rbac_user_roles')
      .select('*, rbac_roles(*)')
      .eq('user_id', userId);
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }
};
