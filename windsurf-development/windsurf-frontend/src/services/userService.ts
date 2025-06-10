
import { apiService } from './apiService';

export const userService = {
  getUsers: (params: any = {}) => apiService.getUsers(params),
  getUser: (id: string) => apiService.getUser(id),
  createUser: (userData: any) => apiService.createUser(userData),
  updateUser: (id: string, updates: any) => apiService.updateUser(id, updates),
  deleteUser: (id: string) => apiService.deleteUser(id),
  bulkCreateUsers: (usersData: any[]) => apiService.bulkCreateUsers(usersData),
  validateBulkUsers: (users: any[]) => apiService.validateBulkUsers(users),
};
