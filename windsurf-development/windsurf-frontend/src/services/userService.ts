
import { apiService } from './api';
import type { User, PaginatedResponse } from '@/types';

export const userService = {
  async getUsers(params: any = {}): Promise<PaginatedResponse<User>> {
    return apiService.getUsers(params);
  },

  async getUser(id: string): Promise<{ user: User }> {
    return apiService.getUser(id);
  },

  async createUser(userData: Partial<User>): Promise<{ userId: string; message: string; user: User }> {
    return apiService.createUser(userData);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<{ message: string }> {
    return apiService.updateUser(id, updates);
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiService.deleteUser(id);
  }
};
