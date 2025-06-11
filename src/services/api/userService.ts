
import apiRequest from '@/config/api';

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role?: string;
  isActive?: boolean;
}

export interface DashboardUser {
  id: string;
  email: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
  phone?: string;
  manager?: string;
  createdAt: string;
  isActive: boolean;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
  phone?: string;
  manager?: string;
}

export const userService = {
  // Get all dashboard users
  async getDashboardUsers(filters: any = {}): Promise<DashboardUser[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<DashboardUser[]>(`/dashboard-users?${params.toString()}`);
  },

  // Get all employees
  async getEmployees(filters: any = {}): Promise<Employee[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<Employee[]>(`/employees?${params.toString()}`);
  },

  // Get single employee
  async getEmployee(id: string): Promise<Employee> {
    return apiRequest<Employee>(`/employees/${id}`);
  },

  // Create dashboard user
  async createDashboardUser(userData: CreateUserRequest): Promise<DashboardUser> {
    return apiRequest<DashboardUser>('/dashboard-users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Update dashboard user
  async updateDashboardUser(id: string, updates: Partial<DashboardUser>): Promise<DashboardUser> {
    return apiRequest<DashboardUser>(`/dashboard-users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  // Delete dashboard user
  async deleteDashboardUser(id: string): Promise<{ success: boolean }> {
    return apiRequest<{ success: boolean }>(`/dashboard-users/${id}`, {
      method: 'DELETE',
    });
  },

  // Get user permissions
  async getUserPermissions(userId: string): Promise<string[]> {
    return apiRequest<string[]>(`/users/${userId}/permissions`);
  },

  // Get user roles
  async getUserRoles(userId: string): Promise<string[]> {
    return apiRequest<string[]>(`/users/${userId}/roles`);
  }
};
