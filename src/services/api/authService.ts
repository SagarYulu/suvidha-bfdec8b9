
import { apiRequest, endpoints } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: string;
  cluster?: string;
  city?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
  phone?: string;
  manager?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

// Authentication service for backend API
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiRequest(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    return response;
  },

  // Register new user
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiRequest(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response;
  },

  // Logout user
  async logout(): Promise<void> {
    await apiRequest(endpoints.auth.logout, {
      method: 'POST',
    });
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await apiRequest(endpoints.auth.me);
    return response.user;
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiRequest(endpoints.auth.changePassword, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });
  },

  // Refresh token
  async refreshToken(): Promise<{ token: string }> {
    const response = await apiRequest(endpoints.auth.refreshToken, {
      method: 'POST',
    });
    
    return response;
  },
};

// Legacy compatibility - maps to backend login
export const login = async (email: string, password: string): Promise<any> => {
  try {
    const response = await authService.login({ email, password });
    
    return {
      id: response.user.id,
      email: response.user.email,
      name: response.user.name,
      role: response.user.role,
    };
  } catch (error) {
    console.error('Login failed:', error);
    return null;
  }
};
