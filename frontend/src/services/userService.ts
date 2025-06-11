
import api from '@/lib/api';
import { User, DashboardUser, ApiResponse } from '@/types';

export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get<ApiResponse<User[]>>('/users');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (userData: Partial<User>): Promise<User | null> => {
  try {
    const response = await api.post<ApiResponse<User>>('/users', userData);
    return response.data.data || null;
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data || null;
  } catch (error) {
    console.error('Error updating user:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/users/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

export const getDashboardUsers = async (): Promise<DashboardUser[]> => {
  try {
    const response = await api.get<ApiResponse<DashboardUser[]>>('/users/dashboard-users');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching dashboard users:', error);
    return [];
  }
};

export const createDashboardUser = async (userData: Partial<DashboardUser>): Promise<DashboardUser | null> => {
  try {
    const response = await api.post<ApiResponse<DashboardUser>>('/users/dashboard-users', userData);
    return response.data.data || null;
  } catch (error) {
    console.error('Error creating dashboard user:', error);
    return null;
  }
};
