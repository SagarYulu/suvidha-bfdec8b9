import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data portion
  },
  (error) => {
    const { response } = error;

    // Handle different error scenarios
    if (response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (response?.status === 403) {
      // Forbidden - show error message
      console.error('Access forbidden:', response.data?.message);
    } else if (response?.status >= 500) {
      // Server errors
      console.error('Server error:', response.data?.message);
    }

    return Promise.reject(response?.data || error);
  }
);

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  employeeLogin: (credentials) => api.post('/auth/employee-login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
};

// Employee API methods
export const employeeAPI = {
  getAll: (params = {}) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (employeeData) => api.post('/employees', employeeData),
  update: (id, employeeData) => api.put(`/employees/${id}`, employeeData),
  delete: (id) => api.delete(`/employees/${id}`),
  getStats: () => api.get('/employees/stats'),
  bulkCreate: (employees) => api.post('/employees/bulk', { employees }),
};

// Issue API methods
export const issueAPI = {
  getAll: (params = {}) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (issueData) => api.post('/issues', issueData),
  update: (id, issueData) => api.put(`/issues/${id}`, issueData),
  delete: (id) => api.delete(`/issues/${id}`),
  getMyAssigned: (params = {}) => api.get('/issues/my-assigned', { params }),
  getStats: (params = {}) => api.get('/issues/stats', { params }),
  assign: (id, assigneeId) => api.put(`/issues/${id}/assign`, { assigned_to: assigneeId }),
  close: (id, resolutionNote) => api.put(`/issues/${id}/close`, { resolution_note: resolutionNote }),
};

// Utility methods
export const apiUtils = {
  // Upload file (for future use with AWS S3)
  uploadFile: (file, type = 'issue-attachment') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Health check
  healthCheck: () => 
    axios.get(process.env.REACT_APP_API_BASE_URL?.replace('/api/v1', '') + '/health'),
};

export default api;