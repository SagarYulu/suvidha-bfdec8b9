
import { api } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  async login(email: string, password: string) {
    const response = await api.post(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  async employeeLogin(employeeId: string, password: string) {
    const response = await api.post(API_ENDPOINTS.EMPLOYEE_LOGIN, { employeeId, password });
    return response.data;
  },

  async register(userData: any) {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  },

  async verifyToken() {
    const response = await api.get(API_ENDPOINTS.VERIFY);
    return response.data.user;
  }
};
