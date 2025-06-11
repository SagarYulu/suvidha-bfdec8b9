
const API_BASE_URL = 'http://localhost:3000/api';

// API configuration for backend communication
export const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Helper function to make API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get token from localStorage if available
  const authState = localStorage.getItem('authState');
  let token = null;
  
  if (authState) {
    try {
      const parsed = JSON.parse(authState);
      token = parsed.token;
    } catch (e) {
      console.warn('Failed to parse auth state');
    }
  }
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// API endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
    refreshToken: '/auth/refresh-token',
  },
  
  // User management endpoints
  users: {
    list: '/dashboard-users',
    create: '/dashboard-users',
    getById: (id: string) => `/dashboard-users/${id}`,
    update: (id: string) => `/dashboard-users/${id}`,
    delete: (id: string) => `/dashboard-users/${id}`,
  },
  
  // Issue endpoints
  issues: {
    list: '/issues',
    create: '/issues',
    getById: (id: string) => `/issues/${id}`,
    update: (id: string) => `/issues/${id}`,
    delete: (id: string) => `/issues/${id}`,
    updateStatus: (id: string) => `/issues/${id}/status`,
    assign: (id: string) => `/issues/${id}/assign`,
    updatePriority: (id: string) => `/issues/${id}/priority`,
    reopen: (id: string) => `/issues/${id}/reopen`,
    escalate: (id: string) => `/issues/${id}/escalate`,
    comments: (id: string) => `/issues/${id}/comments`,
    addComment: (id: string) => `/issues/${id}/comments`,
    analytics: '/issues/stats/overview',
    trends: '/issues/stats/trends',
  },
  
  // Feedback endpoints
  feedback: {
    list: '/feedback',
    create: '/feedback',
    analytics: '/feedback/analytics',
    sentiment: '/feedback/sentiment-analysis',
  },
};
