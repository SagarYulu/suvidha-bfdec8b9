
import { ApiClient } from './apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  role: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  phone: string;
  employeeId: string;
  city: string;
  cluster: string;
  role: string;
  manager?: string;
}

interface UpdateUserData extends Partial<CreateUserData> {
  id: string;
}

class UserService {
  async getUsers(filters: any = {}): Promise<User[]> {
    const response = await ApiClient.get('/api/users');
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await ApiClient.get(`/api/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await ApiClient.post('/api/users', userData);
    return response.data;
  }

  async updateUser(userData: UpdateUserData): Promise<User> {
    const response = await ApiClient.put(`/api/users/${userData.id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await ApiClient.delete(`/api/users/${id}`);
  }

  async bulkCreateUsers(users: CreateUserData[]): Promise<{ created: User[], errors: any[] }> {
    const response = await ApiClient.post('/api/users/bulk', { users });
    return response.data;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    const response = await ApiClient.get(`/api/users?role=${role}`);
    return response.data;
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await ApiClient.get(`/api/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
}

export const userService = new UserService();
