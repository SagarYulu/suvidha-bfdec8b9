
import { mockSupabase as supabase } from '@/lib/mockSupabase';

export const createRole = async (roleData: any) => {
  try {
    const { data, error } = await supabase.from('rbac_roles').insert(roleData);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

export const updateRole = async (roleId: string, roleData: any) => {
  try {
    const { data, error } = await supabase
      .from('rbac_roles')
      .update(roleData)
      .eq('id', roleId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

export const deleteRole = async (roleId: string) => {
  try {
    const { data, error } = await supabase
      .from('rbac_roles')
      .delete()
      .eq('id', roleId);
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};
