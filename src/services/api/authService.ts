
import apiRequest from '@/config/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    cluster?: string;
    city?: string;
  };
}

export interface EmployeeLoginRequest {
  email: string;
  employeeId: string;
}

export const authService = {
  // Admin login
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Employee login  
  async employeeLogin(credentials: EmployeeLoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/employee-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Verify token and get user info
  async verifyToken(): Promise<{ user: LoginResponse['user'] }> {
    return apiRequest<{ user: LoginResponse['user'] }>('/auth/verify');
  },

  // Logout
  async logout(): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    });
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }
};
