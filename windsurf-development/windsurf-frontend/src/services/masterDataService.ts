
import { Role, City, Cluster, AuditLog } from '../types/admin';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const makeRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

// Roles API
export const getRoles = async (): Promise<Role[]> => {
  return makeRequest('/master/roles');
};

export const createRole = async (name: string, createdBy: string): Promise<Role> => {
  return makeRequest('/master/roles', {
    method: 'POST',
    body: JSON.stringify({ name, createdBy }),
  });
};

export const updateRole = async (id: string, name: string, updatedBy: string): Promise<Role> => {
  return makeRequest(`/master/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, updatedBy }),
  });
};

export const deleteRole = async (id: string, deletedBy: string): Promise<boolean> => {
  await makeRequest(`/master/roles/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ deletedBy }),
  });
  return true;
};

// Cities API
export const getCities = async (): Promise<City[]> => {
  return makeRequest('/master/cities');
};

export const createCity = async (name: string, createdBy: string): Promise<City> => {
  return makeRequest('/master/cities', {
    method: 'POST',
    body: JSON.stringify({ name, createdBy }),
  });
};

export const updateCity = async (id: string, name: string, updatedBy: string): Promise<City> => {
  return makeRequest(`/master/cities/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, updatedBy }),
  });
};

export const deleteCity = async (id: string, deletedBy: string): Promise<boolean> => {
  await makeRequest(`/master/cities/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ deletedBy }),
  });
  return true;
};

// Clusters API
export const getClusters = async (cityId?: string): Promise<Cluster[]> => {
  const params = cityId ? `?cityId=${cityId}` : '';
  return makeRequest(`/master/clusters${params}`);
};

export const createCluster = async (name: string, cityId: string, createdBy: string): Promise<Cluster> => {
  return makeRequest('/master/clusters', {
    method: 'POST',
    body: JSON.stringify({ name, cityId, createdBy }),
  });
};

export const updateCluster = async (id: string, name: string, cityId: string, updatedBy: string): Promise<Cluster> => {
  return makeRequest(`/master/clusters/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, cityId, updatedBy }),
  });
};

export const deleteCluster = async (id: string, deletedBy: string): Promise<boolean> => {
  await makeRequest(`/master/clusters/${id}`, {
    method: 'DELETE',
    body: JSON.stringify({ deletedBy }),
  });
  return true;
};

// Audit Logs API
export const getAuditLogs = async (entityType?: string): Promise<AuditLog[]> => {
  const params = entityType ? `?entityType=${entityType}` : '';
  return makeRequest(`/master/audit-logs${params}`);
};
