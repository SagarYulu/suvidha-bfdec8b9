
import { ApiClient } from './apiClient';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
}

interface LoginResponse {
  user: User;
  token: string;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await ApiClient.post('/api/auth/login', {
      email,
      password
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await ApiClient.post('/api/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await ApiClient.get('/api/auth/me');
    return response.data;
  },

  async refreshToken(): Promise<string> {
    const response = await ApiClient.post('/api/auth/refresh');
    return response.data.token;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await ApiClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  async resetPassword(email: string): Promise<void> {
    await ApiClient.post('/api/auth/reset-password', {
      email
    });
  },

  async verifyEmail(token: string): Promise<void> {
    await ApiClient.post('/api/auth/verify-email', {
      token
    });
  }
};
