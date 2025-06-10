
import { apiService } from './apiService';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MobileLoginCredentials {
  employeeId: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  employeeId?: string;
  city?: string;
  cluster?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

class AuthService {
  private token: string | null = null;
  private user: User | null = null;

  constructor() {
    // Initialize from localStorage on service creation
    this.token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/login', credentials);
      
      if (response.data.success) {
        this.setAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async mobileLogin(credentials: MobileLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/mobile-login', credentials);
      
      if (response.data.success) {
        this.setAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Mobile login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiService.post('/auth/refresh');
      
      if (response.data.success) {
        this.setAuthData(response.data.token, response.data.user);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      this.clearAuthData();
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get('/auth/profile');
      
      if (response.data.success) {
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      }
      
      return response.data.user;
    } catch (error: any) {
      console.error('Get profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await apiService.put('/auth/profile', profileData);
      
      if (response.data.success) {
        this.user = { ...this.user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(this.user));
      }
      
      return response.data.user;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiService.post('/auth/change-password', {
        oldPassword,
        newPassword
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.response?.data?.message || 'Failed to change password');
    }
  }

  async verifyToken(): Promise<boolean> {
    try {
      const response = await apiService.get('/auth/verify');
      return response.data.success;
    } catch (error) {
      console.error('Token verification error:', error);
      this.clearAuthData();
      return false;
    }
  }

  private setAuthData(token: string, user: User): void {
    this.token = token;
    this.user = user;
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuthData(): void {
    this.token = null;
    this.user = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Getters
  getToken(): string | null {
    return this.token;
  }

  getUser(): User | null {
    return this.user;
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return !!this.user?.role && roles.includes(this.user.role);
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isEmployee(): boolean {
    return this.hasRole('employee');
  }
}

export const authService = new AuthService();
