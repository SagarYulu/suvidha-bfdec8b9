
import { apiCall } from '@/config/api';
import { User } from '@/types';

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  cluster_id?: string;
}

export const authService = {
  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store token in localStorage
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data;
  },

  // Register user
  register: async (userData: RegisterData): Promise<User> => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response.data.user;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authState');
      localStorage.removeItem('mockUser');
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await apiCall('/auth/me');
    return response.data.user;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiCall('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },

  // Refresh token
  refreshToken: async (): Promise<string> => {
    const response = await apiCall('/auth/refresh-token', {
      method: 'POST',
    });
    
    if (response.data?.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    
    return response.data.token;
  },
};
