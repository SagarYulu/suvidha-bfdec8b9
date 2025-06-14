import { ApiClient } from './apiClient';

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

const login = async (email: string, password: string, isAdminLogin = false): Promise<LoginResponse> => {
  const headers: Record<string, string> = {};
  
  // Add header to identify admin vs mobile login
  if (isAdminLogin) {
    headers['x-admin-login'] = 'true';
  } else {
    headers['x-mobile-login'] = 'true';
  }
  
  const response = await ApiClient.post('/api/auth/login', {
    email,
    password
  }, { headers });
  
  if (response.data.token) {
    ApiClient.setAuthToken(response.data.token);
  }
  
  return response.data;
};

const logout = async (): Promise<void> => {
  await ApiClient.post('/api/auth/logout');
  ApiClient.clearAuthToken();
};

const getCurrentUser = async (): Promise<User> => {
  const response = await ApiClient.get('/api/auth/me');
  return response.data;
};

const refreshToken = async (): Promise<string> => {
  const response = await ApiClient.post('/api/auth/refresh');
  if (response.data.token) {
    ApiClient.setAuthToken(response.data.token);
  }
  return response.data.token;
};

const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await ApiClient.post('/api/auth/change-password', {
    currentPassword,
    newPassword
  });
};

const resetPassword = async (email: string): Promise<void> => {
  await ApiClient.post('/api/auth/forgot-password', {
    email
  });
};

const register = async (userData: {
  email: string;
  password: string;
  full_name: string;
  role: string;
  cluster_id?: string;
}): Promise<User> => {
  const response = await ApiClient.post('/api/auth/register', userData);
  return response.data;
};


// Exporting functions individually for named imports
export { 
  login, 
  logout, 
  getCurrentUser, 
  refreshToken, 
  changePassword, 
  resetPassword, 
  register 
};

// Keeping the grouped export for compatibility
export const authService = {
  login,
  logout,
  getCurrentUser,
  refreshToken,
  changePassword,
  resetPassword,
  register
};
