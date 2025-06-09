
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface MobileLoginCredentials {
  employeeId: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials);
  }

  static async mobileLogin(credentials: MobileLoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH.MOBILE_LOGIN, credentials);
  }

  static async logout(): Promise<void> {
    return apiClient.post<void>(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  }

  static async getCurrentUser(): Promise<{ user: any }> {
    return apiClient.get<{ user: any }>(API_CONFIG.ENDPOINTS.AUTH.ME);
  }

  static async refreshToken(): Promise<{ token: string }> {
    return apiClient.post<{ token: string }>(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
  }

  static async getProfile(): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
  }

  static async verifyToken(): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.AUTH.VERIFY);
  }
}

export default AuthService;
