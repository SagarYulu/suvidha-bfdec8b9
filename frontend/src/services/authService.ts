
import { apiCall } from '@/config/api';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export const authService = {
  // Login user
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  // Register user
  register: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiCall('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
    }
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiCall('/auth/me');
    return response.user;
  },

  // Refresh token
  refreshToken: async (): Promise<string> => {
    const response = await apiCall('/auth/refresh', {
      method: 'POST',
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response.token;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    await apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  },

  // Verify email
  verifyEmail: async (token: string): Promise<void> => {
    await apiCall('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

// Backward compatibility
export const login = authService.login;
export const register = authService.register;
export const logout = authService.logout;
