import { Role, City, Cluster, AuditLog } from "@/types/admin";
import axios from 'axios';

// Helper function to get JWT token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to get axios config with JWT token
const getAxiosConfig = () => {
  const token = getAuthToken();
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// -------------------- Role Management --------------------
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await axios.get('/api/master-roles', getAxiosConfig());
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
    const response = await axios.post('/api/master-roles', { name }, getAxiosConfig());
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
    const response = await axios.put(`/api/master-roles/${id}`, { name }, getAxiosConfig());
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
    await axios.delete(`/api/master-roles/${id}`, getAxiosConfig());
    
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
    const response = await axios.get('/api/master-cities', getAxiosConfig());
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
    const response = await axios.post('/api/master-cities', { name }, getAxiosConfig());
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
    const response = await axios.put(`/api/master-cities/${id}`, { name }, getAxiosConfig());
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
    await axios.delete(`/api/master-cities/${id}`, getAxiosConfig());
    
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
    const response = await axios.get('/api/master-clusters', getAxiosConfig());
    return response.data.map((cluster: any) => ({
      id: cluster.id,
      name: cluster.name,
      cityId: cluster.cityId,
      city: cluster.city,
      createdAt: cluster.createdAt,
      updatedAt: cluster.updatedAt
    })) || [];
  } catch (error) {
    console.error("Error in getClusters:", error);
    return [];
  }
};

export const createCluster = async (name: string, cityId: string, userId: string): Promise<Cluster | null> => {
  try {
    const response = await axios.post('/api/master-clusters', { name, cityId }, getAxiosConfig());
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
      city: data.city,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    };
  } catch (error) {
    console.error("Error creating cluster:", error);
    return null;
  }
};

export const updateCluster = async (id: string, name: string, cityId: string, userId: string): Promise<Cluster | null> => {
  try {
    const response = await axios.put(`/api/master-clusters/${id}`, { name, cityId }, getAxiosConfig());
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
      city: data.city,
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
    await axios.delete(`/api/master-clusters/${id}`, getAxiosConfig());
    
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
export const getAuditLogs = async (): Promise<AuditLog[]> => {
  try {
    // For now, return empty array as audit logs might not be fully implemented
    return [];
  } catch (error) {
    console.error("Error in getAuditLogs:", error);
    return [];
  }
};

export const createAuditLog = async (logEntry: {
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  createdBy: string;
}): Promise<void> => {
  try {
    // For now, just log to console as audit logs might not be fully implemented
    console.log("Audit log created:", logEntry);
  } catch (error) {
    console.error("Error creating audit log:", error);
  }
};