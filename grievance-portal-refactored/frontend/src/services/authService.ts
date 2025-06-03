
import apiService from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface EmployeeLoginCredentials {
  employeeId: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  employeeId?: string;
  phone?: string;
  city?: string;
  cluster?: string;
  role?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phone?: string;
  city?: string;
  cluster?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface EmployeeAuthResponse {
  success: boolean;
  token: string;
  employee: User;
}

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response;
  }

  async employeeLogin(employeeId: string, password: string): Promise<EmployeeAuthResponse> {
    const response = await apiService.post<EmployeeAuthResponse>('/auth/employee/login', {
      employeeId,
      password,
    });

    if (response.success && response.token) {
      localStorage.setItem('authToken', response.token);
    }

    return response;
  }

  async register(userData: RegisterData): Promise<{ success: boolean; message: string }> {
    const response = await apiService.post('/auth/register', userData);
    return response;
  }

  async verifyToken(): Promise<{ success: boolean; user: User }> {
    const response = await apiService.get('/auth/verify');
    return response;
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
}

export const authService = new AuthService();
export default authService;
