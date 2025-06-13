
interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
  cluster_id?: string;
  is_active: boolean;
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

const API_BASE_URL = 'http://localhost:3001';

export const authService = {
  async login(email: string, password: string, isAdminLogin = false): Promise<LoginResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Add header to identify admin vs mobile login
    if (isAdminLogin) {
      headers['x-admin-login'] = 'true';
    } else {
      headers['x-mobile-login'] = 'true';
    }
    
    // Use different endpoints for admin vs mobile login
    const endpoint = isAdminLogin ? '/api/admin/login' : '/api/mobile/login';
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('Making login request to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        password
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }
    
    return data.data;
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }
  },

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get current user');
    }
    
    const data = await response.json();
    return data.data;
  },

  async refreshToken(): Promise<string> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    
    const data = await response.json();
    localStorage.setItem('authToken', data.data.token);
    return data.data.token;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No auth token found');
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to change password');
    }
  },

  async resetPassword(email: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send reset email');
    }
  },

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    cluster_id?: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    const data = await response.json();
    return data.data;
  }
};
