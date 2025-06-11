
import api from '@/lib/api';
import { ApiResponse } from '@/types';

export interface City {
  id: string;
  name: string;
}

export interface Cluster {
  id: string;
  name: string;
  city_id: string;
  city_name?: string;
}

export interface Role {
  id: string;
  name: string;
}

export const getCities = async (): Promise<City[]> => {
  try {
    const response = await api.get<ApiResponse<City[]>>('/master-data/cities');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

export const getClusters = async (cityId?: string): Promise<Cluster[]> => {
  try {
    const params = cityId ? `?cityId=${cityId}` : '';
    const response = await api.get<ApiResponse<Cluster[]>>(`/master-data/clusters${params}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching clusters:', error);
    return [];
  }
};

export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await api.get<ApiResponse<Role[]>>('/master-data/roles');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching roles:', error);
    return [];
  }
};

export const createCity = async (name: string): Promise<City | null> => {
  try {
    const response = await api.post<ApiResponse<City>>('/master-data/cities', { name });
    return response.data.data || null;
  } catch (error) {
    console.error('Error creating city:', error);
    return null;
  }
};

export const createCluster = async (name: string, cityId: string): Promise<Cluster | null> => {
  try {
    const response = await api.post<ApiResponse<Cluster>>('/master-data/clusters', { 
      name, 
      city_id: cityId 
    });
    return response.data.data || null;
  } catch (error) {
    console.error('Error creating cluster:', error);
    return null;
  }
};
