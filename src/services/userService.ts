
import { api } from '../lib/api';

export const getUserById = async (userId: string) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
};

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const createUser = async (userData: any) => {
  try {
    const response = await api.post('/users', userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};
