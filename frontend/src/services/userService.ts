
import { ApiClient } from './apiClient';
import { User } from '@/types';

export class UserService {
  static async getUsers(): Promise<User[]> {
    const response = await ApiClient.get('/api/users');
    return response.data;
  }

  static async getUserById(id: string): Promise<User> {
    const response = await ApiClient.get(`/api/users/${id}`);
    return response.data;
  }

  static async createUser(userData: Partial<User>): Promise<User> {
    const response = await ApiClient.post('/api/users', userData);
    return response.data;
  }

  static async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await ApiClient.put(`/api/users/${id}`, userData);
    return response.data;
  }

  static async deleteUser(id: string): Promise<void> {
    await ApiClient.delete(`/api/users/${id}`);
  }
}

export const getUsers = () => UserService.getUsers();
