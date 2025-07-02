import { ApiClient } from '@/services/ApiClient';
import { User, LoginCredentials, RegisterData } from '@/models/User';
import { ApiResponse } from '@/models/ApiResponse';

export class AuthController {
  private static instance: AuthController;

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string; refreshToken: string }>> {
    try {
      const response = await ApiClient.post('/api/auth/login', credentials);
      
      if (response.data.token) {
        ApiClient.setAuthToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
        data: null
      };
    }
  }

  async register(userData: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response = await ApiClient.post('/api/auth/register', userData);
      
      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
        data: null
      };
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await ApiClient.get('/api/auth/me');
      
      return {
        success: true,
        data: response.data,
        message: 'User fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user',
        data: null
      };
    }
  }

  async refreshToken(): Promise<ApiResponse<{ token: string; refreshToken: string }>> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await ApiClient.post('/api/auth/refresh', { refreshToken });
      
      if (response.data.token) {
        ApiClient.setAuthToken(response.data.token);
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Token refreshed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
        data: null
      };
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    try {
      await ApiClient.post('/api/auth/logout');
      
      ApiClient.clearAuthToken();
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      return {
        success: true,
        data: undefined,
        message: 'Logout successful'
      };
    } catch (error: any) {
      // Even if API call fails, clear local storage
      ApiClient.clearAuthToken();
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      
      return {
        success: true,
        data: undefined,
        message: 'Logout completed'
      };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    try {
      await ApiClient.post('/api/auth/change-password', {
        currentPassword,
        newPassword
      });
      
      return {
        success: true,
        data: undefined,
        message: 'Password changed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
        data: undefined
      };
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    try {
      await ApiClient.post('/api/auth/forgot-password', { email });
      
      return {
        success: true,
        data: undefined,
        message: 'Password reset email sent'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send password reset email',
        data: undefined
      };
    }
  }
}

export const authController = AuthController.getInstance();