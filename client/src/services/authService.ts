import { User } from "@/types";
import axios from 'axios';

const API_BASE_URL = '/api';

export const login = async (email: string, password: string): Promise<User | null> => {
  console.log('Login attempt:', { email });

  try {
    // First try dashboard user login
    try {
      const dashboardResponse = await axios.post(`${API_BASE_URL}/auth/dashboard-login`, {
        email,
        password
      });

      if (dashboardResponse.data.success) {
        const { user, token } = dashboardResponse.data;
        
        // Store the JWT token for future requests
        localStorage.setItem('authToken', token);
        
        console.log('Dashboard user login successful:', user);
        return {
          id: user.id.toString(),
          userId: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          employeeId: `DASH-${user.id}`,
          city: user.city || 'System',
          cluster: user.cluster || 'System',
          manager: user.manager || '',
          role: user.role,
          password: '', // Don't store password
          dateOfJoining: user.dateOfJoining || '2023-01-01',
          bloodGroup: user.bloodGroup || '',
          dateOfBirth: user.dateOfBirth || '',
          accountNumber: user.accountNumber || '',
          ifscCode: user.ifscCode || ''
        };
      }
    } catch (dashboardError) {
      console.log('Dashboard user login failed, trying employee login');
    }

    // If dashboard login fails, try employee login
    try {
      const employeeResponse = await axios.post(`${API_BASE_URL}/auth/employee-login`, {
        email,
        password
      });

      if (employeeResponse.data.success) {
        const { user, token } = employeeResponse.data;
        
        // Store the JWT token for future requests
        localStorage.setItem('authToken', token);
        
        console.log('Employee login successful:', user);
        return {
          id: user.id.toString(),
          userId: user.id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          employeeId: user.empId || `EMP-${user.id}`,
          city: user.city || '',
          cluster: user.cluster || '',
          manager: user.manager || '',
          role: user.role || 'employee',
          password: '', // Don't store password
          dateOfJoining: user.dateOfJoining || '',
          bloodGroup: user.bloodGroup || '',
          dateOfBirth: user.dateOfBirth || '',
          accountNumber: user.accountNumber || '',
          ifscCode: user.ifscCode || ''
        };
      }
    } catch (employeeError) {
      console.log('Employee login failed');
    }

    console.log('Both login attempts failed');
    return null;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Clear the JWT token
    localStorage.removeItem('authToken');
    console.log('Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return null;
    }

    // Verify the token with the backend
    const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.data.success) {
      const user = response.data.user;
      return {
        id: user.id.toString(),
        userId: user.id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        employeeId: user.empId || user.employeeId || `USER-${user.id}`,
        city: user.city || '',
        cluster: user.cluster || '',
        manager: user.manager || '',
        role: user.role || 'user',
        password: '', // Don't store password
        dateOfJoining: user.dateOfJoining || '',
        bloodGroup: user.bloodGroup || '',
        dateOfBirth: user.dateOfBirth || '',
        accountNumber: user.accountNumber || '',
        ifscCode: user.ifscCode || ''
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    // Clear invalid token
    localStorage.removeItem('authToken');
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('authToken');
};