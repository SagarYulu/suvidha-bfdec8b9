
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export interface UserFilters {
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  static async getUsers(filters?: UserFilters): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.USERS.BASE, filters);
  }

  static async getUser(id: string): Promise<any> {
    return apiClient.get<any>(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${id}`);
  }

  static async createUser(userData: any): Promise<any> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.USERS.BASE, userData);
  }

  static async updateUser(id: string, updates: any): Promise<any> {
    return apiClient.put<any>(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${id}`, updates);
  }

  static async deleteUser(id: string): Promise<any> {
    return apiClient.delete<any>(`${API_CONFIG.ENDPOINTS.USERS.BASE}/${id}`);
  }
}

export default UserService;
