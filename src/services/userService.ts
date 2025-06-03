
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
