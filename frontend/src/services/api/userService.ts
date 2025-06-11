
import { apiCall } from '@/config/api';
import { User, DashboardUser } from '@/types';

export interface UserFilters {
  role?: string;
  is_active?: boolean;
  cluster_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface DashboardUserCreateData {
  email: string;
  password: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
}

export interface DashboardUserUpdateData {
  name?: string;
  role?: string;
  cluster?: string;
  city?: string;
  phone?: string;
  manager?: string;
}

export const userService = {
  // Get all dashboard users
  getDashboardUsers: async (filters?: UserFilters): Promise<DashboardUser[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/dashboard-users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data || [];
  },

  // Get dashboard user by ID
  getDashboardUserById: async (id: string): Promise<DashboardUser> => {
    const response = await apiCall(`/dashboard-users/${id}`);
    return response.data;
  },

  // Create dashboard user
  createDashboardUser: async (userData: DashboardUserCreateData): Promise<DashboardUser> => {
    const response = await apiCall('/dashboard-users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  // Update dashboard user
  updateDashboardUser: async (id: string, updateData: DashboardUserUpdateData): Promise<DashboardUser> => {
    const response = await apiCall(`/dashboard-users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Delete dashboard user
  deleteDashboardUser: async (id: string): Promise<void> => {
    await apiCall(`/dashboard-users/${id}`, {
      method: 'DELETE',
    });
  },

  // Get employees
  getEmployees: async (filters?: any): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/employees${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data || [];
  },

  // Get employee by ID
  getEmployeeById: async (id: string): Promise<User> => {
    const response = await apiCall(`/employees/${id}`);
    return response.data;
  },

  // Update employee
  updateEmployee: async (id: string, updateData: any): Promise<User> => {
    const response = await apiCall(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Get user count
  getUserCount: async (filters?: UserFilters): Promise<number> => {
    const response = await apiCall('/dashboard-users/count');
    return response.data?.total || 0;
  },
};
