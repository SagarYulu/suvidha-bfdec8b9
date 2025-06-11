
import { apiCall } from '@/config/api';
import { User } from '@/types';

export interface UserCreateData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  role: 'admin' | 'manager' | 'agent' | 'employee';
  permissions?: string[];
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  role?: 'admin' | 'manager' | 'agent' | 'employee';
  permissions?: string[];
  is_active?: boolean;
}

export interface UserFilters {
  role?: string;
  city?: string;
  cluster?: string;
  search?: string;
  is_active?: boolean;
  limit?: number;
  offset?: number;
}

export const userService = {
  // Get all users with filters
  getUsers: async (filters?: UserFilters): Promise<User[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data || [];
  },

  // Get employees only
  getEmployees: async (): Promise<User[]> => {
    const response = await apiCall('/users?role=employee');
    return response.data || [];
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiCall(`/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (userData: UserCreateData): Promise<User> => {
    const response = await apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  },

  // Update user
  updateUser: async (id: string, updateData: UserUpdateData): Promise<User> => {
    const response = await apiCall(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiCall(`/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Change user password
  changePassword: async (id: string, currentPassword: string, newPassword: string): Promise<void> => {
    await apiCall(`/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  },

  // Get user permissions
  getUserPermissions: async (id: string): Promise<string[]> => {
    const response = await apiCall(`/users/${id}/permissions`);
    return response.data || [];
  },

  // Update user permissions
  updateUserPermissions: async (id: string, permissions: string[]): Promise<void> => {
    await apiCall(`/users/${id}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permissions }),
    });
  },

  // Bulk create users
  bulkCreateUsers: async (users: UserCreateData[]): Promise<{ success: User[]; errors: any[] }> => {
    const response = await apiCall('/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
    return response.data;
  },

  // Export users
  exportUsers: async (filters?: UserFilters): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`http://localhost:3000/api/users/export?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },
};

// Alias for backward compatibility
export const getUsers = userService.getUsers;
export const getEmployees = userService.getEmployees;
