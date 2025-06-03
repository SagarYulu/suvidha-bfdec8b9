
import { mockSupabase as supabase } from '@/lib/mockSupabase';

export const getMasterCities = async () => {
  try {
    const { data, error } = await supabase.from('master_cities').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getMasterClusters = async () => {
  try {
    const { data, error } = await supabase.from('master_clusters').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return [];
  }
};

export const getMasterRoles = async () => {
  try {
    const { data, error } = await supabase.from('master_roles').select('*');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};
