
// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth endpoints
  ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`,
  EMPLOYEE_LOGIN: `${API_BASE_URL}/auth/employee/login`,
  VERIFY_TOKEN: `${API_BASE_URL}/auth/verify`,
  
  // Issues endpoints
  ISSUES: `${API_BASE_URL}/issues`,
  EMPLOYEE_ISSUES: `${API_BASE_URL}/issues/employee/my-issues`,
  
  // Analytics endpoints
  ANALYTICS: `${API_BASE_URL}/analytics/dashboard`,
  
  // Users endpoints
  USERS: `${API_BASE_URL}/users`,
  
  // Feedback endpoints
  FEEDBACK: `${API_BASE_URL}/feedback`,
};

// HTTP client configuration
export const apiClient = {
  get: async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  post: async (url: string, data?: any, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  patch: async (url: string, data?: any, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
  
  delete: async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },
};
