
import { apiRequest, endpoints } from '@/config/api';

export interface Employee {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  cluster?: string;
  role?: string;
  manager?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  accountNumber?: string;
  ifscCode?: string;
  userId?: string;
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
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: string;
  cluster?: string;
  city?: string;
  phone?: string;
  manager?: string;
}

export interface UserFilters {
  role?: string;
  city?: string;
  cluster?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// User service for backend API
export const userService = {
  // Get all dashboard users
  async getDashboardUsers(filters?: UserFilters): Promise<DashboardUser[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.users.list}?${queryParams.toString()}`
      : endpoints.users.list;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },

  // Get user by ID
  async getUserById(id: string): Promise<DashboardUser> {
    const response = await apiRequest(endpoints.users.getById(id));
    return response.data || response;
  },

  // Create new dashboard user
  async createUser(userData: CreateUserData): Promise<DashboardUser> {
    const response = await apiRequest(endpoints.users.create, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return response.data || response;
  },

  // Update user
  async updateUser(id: string, updateData: Partial<CreateUserData>): Promise<DashboardUser> {
    const response = await apiRequest(endpoints.users.update(id), {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    return response.data || response;
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    await apiRequest(endpoints.users.delete(id), {
      method: 'DELETE',
    });
  },

  // Get employee by UUID (for mobile app compatibility)
  async getEmployeeByUuid(uuid: string): Promise<Employee | null> {
    try {
      // Try to get from employees endpoint or user details
      const response = await apiRequest(`/employees/${uuid}`);
      return response.data || response;
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  },
};

// Legacy compatibility functions
export const getUserById = async (id: string): Promise<any> => {
  try {
    return await userService.getUserById(id);
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};
