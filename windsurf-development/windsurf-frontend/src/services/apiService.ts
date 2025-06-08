
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  // Authentication
  static async login(credentials: { email: string; password: string }) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  }

  static async mobileLogin(credentials: { employeeId: string; email: string }) {
    const response = await apiClient.post('/auth/mobile-login', credentials);
    return response.data;
  }

  static async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  }

  // Issues
  static async getIssues(params?: any) {
    const response = await apiClient.get('/issues', { params });
    return response.data;
  }

  static async getIssue(id: string) {
    const response = await apiClient.get(`/issues/${id}`);
    return response.data;
  }

  static async createIssue(issueData: any) {
    const response = await apiClient.post('/issues', issueData);
    return response.data;
  }

  static async updateIssue(id: string, updateData: any) {
    const response = await apiClient.put(`/issues/${id}`, updateData);
    return response.data;
  }

  static async assignIssue(id: string, assigneeId: string) {
    const response = await apiClient.post(`/issues/${id}/assign`, { assignedTo: assigneeId });
    return response.data;
  }

  static async addComment(id: string, content: string) {
    const response = await apiClient.post(`/issues/${id}/comments`, { content });
    return response.data;
  }

  static async addInternalComment(id: string, content: string) {
    const response = await apiClient.post(`/issues/${id}/internal-comments`, { content });
    return response.data;
  }

  // File Upload
  static async uploadFile(file: File, category = 'attachments') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await apiClient.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async uploadMultipleFiles(files: File[], category = 'attachments') {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', category);

    const response = await apiClient.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deleteFile(filename: string, category = 'attachments') {
    const response = await apiClient.delete(`/upload/${category}/${filename}`);
    return response.data;
  }

  // Real-time connection
  static createRealtimeConnection() {
    const token = localStorage.getItem('authToken');
    const eventSource = new EventSource(`${API_BASE_URL}/api/realtime/stream?token=${token}`);
    return eventSource;
  }

  // Dashboard
  static async getDashboardMetrics(filters?: any) {
    const response = await apiClient.get('/dashboard/metrics', { params: filters });
    return response.data;
  }

  static async getChartData(type: string, filters?: any) {
    const response = await apiClient.get('/dashboard/charts', { 
      params: { type, filters: JSON.stringify(filters) } 
    });
    return response.data;
  }

  // Users
  static async getUsers(params?: any) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  }

  static async createUser(userData: any) {
    const response = await apiClient.post('/users', userData);
    return response.data;
  }

  static async updateUser(id: string, userData: any) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  }

  // Feedback
  static async submitFeedback(feedbackData: any) {
    const response = await apiClient.post('/feedback', feedbackData);
    return response.data;
  }

  static async getFeedback(params?: any) {
    const response = await apiClient.get('/feedback', { params });
    return response.data;
  }

  // Analytics
  static async getAnalytics(params?: any) {
    const response = await apiClient.get('/analytics', { params });
    return response.data;
  }

  static async exportData(type: string, filters?: any) {
    const response = await apiClient.get(`/analytics/export/${type}`, {
      params: filters,
      responseType: 'blob'
    });
    return response.data;
  }

  // Notifications
  static async getNotifications(userId: string, params?: any) {
    const response = await apiClient.get(`/notifications/${userId}`, { params });
    return response.data;
  }

  static async markNotificationAsRead(notificationId: string) {
    const response = await apiClient.post(`/notifications/${notificationId}/read`);
    return response.data;
  }

  static async markAllNotificationsAsRead(userId: string) {
    const response = await apiClient.post(`/notifications/read-all/${userId}`);
    return response.data;
  }

  // Health check
  static async getHealthStatus() {
    const response = await apiClient.get('/health');
    return response.data;
  }

  static async getServiceStatus() {
    const response = await apiClient.get('/status');
    return response.data;
  }
}

export default ApiService;
