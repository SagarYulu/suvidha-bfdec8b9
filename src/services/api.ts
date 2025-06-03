
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.request<{ token: string }>('/api/auth/refresh', {
      method: 'POST',
    }).then(response => {
      const newToken = response.token;
      this.setToken(newToken);
      this.isRefreshing = false;
      this.refreshPromise = null;
      return newToken;
    }).catch(error => {
      this.isRefreshing = false;
      this.refreshPromise = null;
      this.clearToken();
      window.location.href = '/admin/login';
      throw error;
    });

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token && !endpoint.includes('/auth/refresh')) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (response.status === 401 && !endpoint.includes('/auth/')) {
        try {
          const newToken = await this.refreshToken();
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, { ...config, headers });
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ error: 'Network error' }));
            throw this.createApiError(error.error || `HTTP ${retryResponse.status}`, retryResponse.status);
          }
          
          return await retryResponse.json();
        } catch (refreshError) {
          this.clearToken();
          window.location.href = '/admin/login';
          throw this.createApiError('Session expired. Please login again.', 401);
        }
      }
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw this.createApiError(error.error || `HTTP ${response.status}`, response.status, error.code);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'ApiError') {
        throw error;
      }
      
      console.error('API request failed:', error);
      throw this.createApiError('Network error. Please check your connection.', 0);
    }
  }

  private createApiError(message: string, status: number, code?: string): ApiError {
    const error = new Error(message) as Error & ApiError;
    error.name = 'ApiError';
    error.status = status;
    error.code = code;
    return error;
  }

  // File upload method
  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    }

    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        try {
          const newToken = await this.refreshToken();
          headers.Authorization = `Bearer ${newToken}`;
          const retryResponse = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
          });
          
          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ error: 'Upload failed' }));
            throw this.createApiError(error.error || `HTTP ${retryResponse.status}`, retryResponse.status);
          }
          
          return await retryResponse.json();
        } catch (refreshError) {
          this.clearToken();
          window.location.href = '/admin/login';
          throw this.createApiError('Session expired. Please login again.', 401);
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw this.createApiError(error.error || `HTTP ${response.status}`, response.status);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'ApiError') {
        throw error;
      }
      console.error('File upload failed:', error);
      throw this.createApiError('File upload failed. Please try again.', 0);
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request<{ token: string; user: any }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/api/auth/me');
  }

  async refreshUserToken() {
    return this.request<{ token: string }>('/api/auth/refresh', {
      method: 'POST',
    });
  }

  // Issues endpoints
  async getIssues(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/api/issues?${queryString}`);
  }

  async getIssue(id: string) {
    return this.request<any>(`/api/issues/${id}`);
  }

  async createIssue(issueData: any) {
    return this.request<{ issueId: string; message: string }>('/api/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(id: string, updates: any) {
    return this.request<{ message: string }>(`/api/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async assignIssue(issueId: string, assigneeId: string) {
    return this.request<{ message: string }>(`/api/issues/${issueId}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ assignedTo: assigneeId }),
    });
  }

  async uploadIssueAttachment(issueId: string, file: File) {
    return this.uploadFile(`/api/issues/${issueId}/upload`, file);
  }

  async addComment(issueId: string, content: string) {
    return this.request<{ commentId: string; message: string }>(
      `/api/issues/${issueId}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
  }

  async addInternalComment(issueId: string, content: string) {
    return this.request<{ commentId: string; message: string }>(
      `/api/issues/${issueId}/internal-comments`,
      {
        method: 'POST',
        body: JSON.stringify({ content }),
      }
    );
  }

  // Export endpoints
  async exportIssues(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/api/export/issues?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async exportAnalytics(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/api/export/analytics?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  async exportFeedback(filters: any = {}) {
    const params = new URLSearchParams(filters).toString();
    const response = await fetch(`${this.baseURL}/api/export/feedback?${params}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Notifications endpoints
  async getNotifications(limit: number = 50) {
    return this.request<{ notifications: any[] }>(`/api/notifications?limit=${limit}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.request<{ message: string }>(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  // Analytics endpoints
  async getAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/api/analytics?${queryString}`);
  }

  async getTrends(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/api/analytics/trends?${queryString}`);
  }

  // Feedback endpoints
  async submitFeedback(feedbackData: any) {
    return this.request<{ message: string }>('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedbackAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/api/feedback/analytics?${queryString}`);
  }

  // Users endpoints
  async getUsers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/api/users?${queryString}`);
  }

  async getUser(id: string) {
    return this.request<any>(`/api/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request<{ userId: string; message: string; user: any }>(
      '/api/users',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
  }

  async updateUser(id: string, updates: any) {
    return this.request<{ message: string }>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
export default apiService;
