
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

class ApiService {
  private baseURL: string;
  private token: string | null = null;

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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
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

  async refreshToken() {
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
