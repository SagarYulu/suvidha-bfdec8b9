import { Role, City, Cluster, AuditLog } from "@/types/admin";
import { supabase } from "@/integrations/supabase/client";

// -------------------- Role Management --------------------
export const getRoles = async (): Promise<Role[]> => {
  try {
    const { data, error } = await supabase
      .from('master_roles')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
    
    return data.map(role => ({
      id: role.id,
      name: role.name,
      createdAt: role.created_at,
      updatedAt: role.updated_at
    })) || [];
  } catch (error) {
    console.error("Error in getRoles:", error);
    return [];
  }
};

export const createRole = async (name: string, userId: string): Promise<Role | null> => {
  try {
    const { data, error } = await supabase
      .from('master_roles')
      .insert({ name })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating role:", error);
      return null;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'role',
      entityId: data.id,
      action: 'create',
      changes: { name },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error in createRole:", error);
    return null;
  }
};

export const updateRole = async (id: string, name: string, userId: string): Promise<Role | null> => {
  try {
    // Get current role data for audit
    const { data: currentRole } = await supabase
      .from('master_roles')
      .select('*')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('master_roles')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating role:", error);
      return null;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'role',
      entityId: id,
      action: 'update',
      changes: { 
        before: { name: currentRole?.name }, 
        after: { name } 
      },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error in updateRole:", error);
    return null;
  }
};

export const deleteRole = async (id: string, userId: string): Promise<boolean> => {
  try {
    // Get current role data for audit
    const { data: currentRole } = await supabase
      .from('master_roles')
      .select('*')
      .eq('id', id)
      .single();
      
    const { error } = await supabase
      .from('master_roles')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting role:", error);
      return false;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'role',
      entityId: id,
      action: 'delete',
      changes: { deleted: currentRole },
      createdBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error in deleteRole:", error);
    return false;
  }
};

// -------------------- City Management --------------------
export const getCities = async (): Promise<City[]> => {
  try {
    const { data, error } = await supabase
      .from('master_cities')
      .select('*')
      .order('name');
      
    if (error) {
      console.error("Error fetching cities:", error);
      return [];
    }
    
    return data.map(city => ({
      id: city.id,
      name: city.name,
      createdAt: city.created_at,
      updatedAt: city.updated_at
    })) || [];
  } catch (error) {
    console.error("Error in getCities:", error);
    return [];
  }
};

export const createCity = async (name: string, userId: string): Promise<City | null> => {
  try {
    const { data, error } = await supabase
      .from('master_cities')
      .insert({ name })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating city:", error);
      return null;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'city',
      entityId: data.id,
      action: 'create',
      changes: { name },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error in createCity:", error);
    return null;
  }
};

export const updateCity = async (id: string, name: string, userId: string): Promise<City | null> => {
  try {
    // Get current city data for audit
    const { data: currentCity } = await supabase
      .from('master_cities')
      .select('*')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('master_cities')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating city:", error);
      return null;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'city',
      entityId: id,
      action: 'update',
      changes: { 
        before: { name: currentCity?.name }, 
        after: { name } 
      },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error in updateCity:", error);
    return null;
  }
};

export const deleteCity = async (id: string, userId: string): Promise<boolean> => {
  try {
    // Get current city data for audit
    const { data: currentCity } = await supabase
      .from('master_cities')
      .select('*')
      .eq('id', id)
      .single();
      
    const { error } = await supabase
      .from('master_cities')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting city:", error);
      return false;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'city',
      entityId: id,
      action: 'delete',
      changes: { deleted: currentCity },
      createdBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error in deleteCity:", error);
    return false;
  }
};

// -------------------- Cluster Management --------------------
export const getClusters = async (): Promise<Cluster[]> => {
  try {
    const { data, error } = await supabase
      .from('master_clusters')
      .select('*, master_cities(name)')
      .order('name');
      
    if (error) {
      console.error("Error fetching clusters:", error);
      return [];
    }
    
    return data.map(cluster => ({
      id: cluster.id,
      name: cluster.name,
      cityName: cluster.master_cities?.name,
      cityId: cluster.city_id,
      createdAt: cluster.created_at,
      updatedAt: cluster.updated_at
    }));
  } catch (error) {
    console.error("Error in getClusters:", error);
    return [];
  }
};

export const getClustersByCity = async (cityId: string): Promise<Cluster[]> => {
  try {
    const { data, error } = await supabase
      .from('master_clusters')
      .select('*, master_cities(name)')
      .eq('city_id', cityId)
      .order('name');
      
    if (error) {
      console.error("Error fetching clusters by city:", error);
      return [];
    }
    
    return data.map(cluster => ({
      id: cluster.id,
      name: cluster.name,
      cityName: cluster.master_cities?.name,
      cityId: cluster.city_id,
      createdAt: cluster.created_at,
      updatedAt: cluster.updated_at
    }));
  } catch (error) {
    console.error("Error in getClustersByCity:", error);
    return [];
  }
};

export const createCluster = async (name: string, cityId: string, userId: string): Promise<Cluster | null> => {
  try {
    const { data, error } = await supabase
      .from('master_clusters')
      .insert({ name, city_id: cityId })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating cluster:", error);
      return null;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'cluster',
      entityId: data.id,
      action: 'create',
      changes: { name, city_id: cityId },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      cityId: data.city_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error in createCluster:", error);
    return null;
  }
};

export const updateCluster = async (
  id: string, 
  name: string, 
  cityId: string, 
  userId: string
): Promise<Cluster | null> => {
  try {
    // Get current cluster data for audit
    const { data: currentCluster } = await supabase
      .from('master_clusters')
      .select('*')
      .eq('id', id)
      .single();
    
    const { data, error } = await supabase
      .from('master_clusters')
      .update({ 
        name, 
        city_id: cityId, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select('*, master_cities(name)')
      .single();
      
    if (error) {
      console.error("Error updating cluster:", error);
      return null;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'cluster',
      entityId: id,
      action: 'update',
      changes: { 
        before: { 
          name: currentCluster?.name,
          city_id: currentCluster?.city_id
        }, 
        after: { 
          name,
          city_id: cityId
        } 
      },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      cityName: data.master_cities?.name,
      cityId: data.city_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error("Error in updateCluster:", error);
    return null;
  }
};

export const deleteCluster = async (id: string, userId: string): Promise<boolean> => {
  try {
    // Get current cluster data for audit
    const { data: currentCluster } = await supabase
      .from('master_clusters')
      .select('*')
      .eq('id', id)
      .single();
      
    const { error } = await supabase
      .from('master_clusters')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting cluster:", error);
      return false;
    }
    
    // Log audit entry
    await createAuditLog({
      entityType: 'cluster',
      entityId: id,
      action: 'delete',
      changes: { deleted: currentCluster },
      createdBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error in deleteCluster:", error);
    return false;
  }
};

// -------------------- Audit Logging --------------------
export const createAuditLog = async (logData: Omit<AuditLog, 'id' | 'createdAt' | 'userName'>): Promise<void> => {
  try {
    await supabase
      .from('master_audit_logs')
      .insert({
        entity_type: logData.entityType,
        entity_id: logData.entityId,
        action: logData.action,
        changes: logData.changes,
        created_by: logData.createdBy
      });
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};

export const getAuditLogs = async (
  entityType?: 'role' | 'city' | 'cluster',
  entityId?: string,
  limit: number = 100
): Promise<AuditLog[]> => {
  try {
    let query = supabase
      .from('master_audit_logs')
      .select('*, employees(name)')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    
    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    
    const { data, error } = await query;
      
    if (error) {
      console.error("Error fetching audit logs:", error);
      return [];
    }
    
    return data.map(log => ({
      id: log.id,
      entityType: log.entity_type as 'role' | 'city' | 'cluster',
      entityId: log.entity_id,
      action: log.action as 'create' | 'update' | 'delete',
      changes: log.changes,
      createdBy: log.created_by,
      createdAt: log.created_at,
      userName: log.employees?.name
    }));
  } catch (error) {
    console.error("Error in getAuditLogs:", error);
    return [];
  }
};
