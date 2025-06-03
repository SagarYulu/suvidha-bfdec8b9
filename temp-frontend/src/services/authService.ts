
import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface EmployeeLoginCredentials {
  employeeId: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface Employee {
  uuid: string;
  name: string;
  employeeId: string;
  manager: string;
}

export const authService = {
  // Admin login
  adminLogin: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN_LOGIN, credentials);
    
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('mockUser', JSON.stringify(response.user));
      return { token: response.token, user: response.user };
    }
    
    throw new Error('Login failed');
  },

  // Employee login
  employeeLogin: async (credentials: EmployeeLoginCredentials): Promise<{ token: string; employee: Employee }> => {
    const response = await apiClient.post(API_ENDPOINTS.EMPLOYEE_LOGIN, credentials);
    
    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('mockEmployee', JSON.stringify(response.employee));
      return { token: response.token, employee: response.employee };
    }
    
    throw new Error('Login failed');
  },

  // Verify token
  verifyToken: async (): Promise<User> => {
    const response = await apiClient.get(API_ENDPOINTS.VERIFY_TOKEN);
    
    if (response.success) {
      return response.user;
    }
    
    throw new Error('Token verification failed');
  },

  // Logout
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('mockUser');
    localStorage.removeItem('mockEmployee');
  },

  // Get stored user
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('mockUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get stored employee
  getStoredEmployee: (): Employee | null => {
    const employeeStr = localStorage.getItem('mockEmployee');
    return employeeStr ? JSON.parse(employeeStr) : null;
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};
