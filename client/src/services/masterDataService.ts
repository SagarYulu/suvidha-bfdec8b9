import { Role, City, Cluster, AuditLog } from "@/types/admin";
import axios from 'axios';

// -------------------- Role Management --------------------
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await axios.get('/api/master-roles');
    return response.data.map((role: any) => ({
      id: role.id,
      name: role.name,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    })) || [];
  } catch (error) {
    console.error("Error in getRoles:", error);
    return [];
  }
};

export const createRole = async (name: string, userId: string): Promise<Role | null> => {
  try {
    const response = await axios.post('/api/master-roles', { name });
    const data = response.data;
    
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error creating role:", error);
    return null;
  }
};

export const updateRole = async (id: string, name: string, userId: string): Promise<Role | null> => {
  try {
    const response = await axios.put(`/api/master-roles/${id}`, { name });
    const data = response.data;
    
    // Log audit entry
    await createAuditLog({
      entityType: 'role',
      entityId: id,
      action: 'update',
      changes: { name },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error updating role:", error);
    return null;
  }
};

export const deleteRole = async (id: string, userId: string): Promise<boolean> => {
  try {
    await axios.delete(`/api/master-roles/${id}`);
    
    // Log audit entry
    await createAuditLog({
      entityType: 'role',
      entityId: id,
      action: 'delete',
      changes: {},
      createdBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    return false;
  }
};

// -------------------- City Management --------------------
export const getCities = async (): Promise<City[]> => {
  try {
    const response = await axios.get('/api/master-cities');
    return response.data.map((city: any) => ({
      id: city.id,
      name: city.name,
      createdAt: city.createdAt,
      updatedAt: city.updatedAt
    })) || [];
  } catch (error) {
    console.error("Error in getCities:", error);
    return [];
  }
};

export const createCity = async (name: string, userId: string): Promise<City | null> => {
  try {
    const response = await axios.post('/api/master-cities', { name });
    const data = response.data;
    
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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error creating city:", error);
    return null;
  }
};

export const updateCity = async (id: string, name: string, userId: string): Promise<City | null> => {
  try {
    const response = await axios.put(`/api/master-cities/${id}`, { name });
    const data = response.data;
    
    // Log audit entry
    await createAuditLog({
      entityType: 'city',
      entityId: id,
      action: 'update',
      changes: { name },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error updating city:", error);
    return null;
  }
};

export const deleteCity = async (id: string, userId: string): Promise<boolean> => {
  try {
    await axios.delete(`/api/master-cities/${id}`);
    
    // Log audit entry
    await createAuditLog({
      entityType: 'city',
      entityId: id,
      action: 'delete',
      changes: {},
      createdBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting city:", error);
    return false;
  }
};

// -------------------- Cluster Management --------------------
export const getClusters = async (): Promise<Cluster[]> => {
  try {
    const response = await axios.get('/api/master-clusters');
    return response.data.map((cluster: any) => ({
      id: cluster.id,
      name: cluster.name,
      cityId: cluster.cityId,
      cityName: cluster.cityName,
      createdAt: cluster.createdAt,
      updatedAt: cluster.updatedAt
    })) || [];
  } catch (error) {
    console.error("Error in getClusters:", error);
    return [];
  }
};

export const getClustersByCity = async (cityId: string): Promise<Cluster[]> => {
  try {
    const allClusters = await getClusters();
    return allClusters.filter(cluster => cluster.cityId === cityId);
  } catch (error) {
    console.error("Error in getClustersByCity:", error);
    return [];
  }
};

export const createCluster = async (name: string, cityId: string, userId: string): Promise<Cluster | null> => {
  try {
    const response = await axios.post('/api/master-clusters', { name, cityId: parseInt(cityId) });
    const data = response.data;
    
    // Log audit entry
    await createAuditLog({
      entityType: 'cluster',
      entityId: data.id,
      action: 'create',
      changes: { name, cityId },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      cityId: data.cityId,
      cityName: '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error creating cluster:", error);
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
    const response = await axios.put(`/api/master-clusters/${id}`, { name, cityId: parseInt(cityId) });
    const data = response.data;
    
    // Log audit entry
    await createAuditLog({
      entityType: 'cluster',
      entityId: id,
      action: 'update',
      changes: { name, cityId },
      createdBy: userId
    });
    
    return {
      id: data.id,
      name: data.name,
      cityId: data.cityId,
      cityName: '',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error updating cluster:", error);
    return null;
  }
};

export const deleteCluster = async (id: string, userId: string): Promise<boolean> => {
  try {
    await axios.delete(`/api/master-clusters/${id}`);
    
    // Log audit entry
    await createAuditLog({
      entityType: 'cluster',
      entityId: id,
      action: 'delete',
      changes: {},
      createdBy: userId
    });
    
    return true;
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return false;
  }
};

// -------------------- Audit Log Management --------------------
export const createAuditLog = async (logData: Omit<AuditLog, 'id' | 'createdAt' | 'userName'>): Promise<void> => {
  try {
    await axios.post('/api/audit-logs', logData);
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};

export const getAuditLogs = async (
  entityType?: string,
  entityId?: string,
  limit: number = 50,
  offset: number = 0
): Promise<AuditLog[]> => {
  try {
    const params = new URLSearchParams();
    if (entityType) params.append('entityType', entityType);
    if (entityId) params.append('entityId', entityId);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    
    const response = await axios.get(`/api/audit-logs?${params}`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
};