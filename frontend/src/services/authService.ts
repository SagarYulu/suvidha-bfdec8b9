
import { ApiClient } from './apiClient';

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
  cluster_id?: string;
  is_active: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export const authService = {
  async login(email: string, password: string, isAdminLogin = false): Promise<LoginResponse> {
    const headers: Record<string, string> = {};
    
    // Add header to identify admin vs mobile login
    if (isAdminLogin) {
      headers['x-admin-login'] = 'true';
    } else {
      headers['x-mobile-login'] = 'true';
    }
    
    // Use different endpoints for admin vs mobile login
    const endpoint = isAdminLogin ? '/api/admin/login' : '/api/mobile/login';
    
    const response = await ApiClient.post(endpoint, {
      email,
      password
    }, { headers });
    
    if (response.data.token) {
      ApiClient.setAuthToken(response.data.token);
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    await ApiClient.post('/api/auth/logout');
    ApiClient.clearAuthToken();
  },

  async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get('/api/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<string> {
    const response = await ApiClient.post('/api/auth/refresh');
    if (response.data.token) {
      ApiClient.setAuthToken(response.data.token);
    }
    return response.data.token;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await ApiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  async resetPassword(email: string): Promise<void> {
    await ApiClient.post('/api/auth/forgot-password', {
      email
    });
  },

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    cluster_id?: string;
  }): Promise<User> {
    const response = await ApiClient.post('/api/auth/register', userData);
    return response.data;
  }
};
