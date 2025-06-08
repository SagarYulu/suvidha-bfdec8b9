
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async mobileLogin(credentials: { email: string; employeeId: string }) {
    return this.request('/auth/mobile-login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // User endpoints
  async getUsers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  async bulkCreateUsers(usersData: any[]) {
    return this.request('/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users: usersData }),
    });
  }

  async validateBulkUsers(users: any[]) {
    return this.request('/users/validate-bulk', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  }

  // Issue endpoints
  async getIssues(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/issues${queryString ? `?${queryString}` : ''}`);
  }

  async getIssue(id: string) {
    return this.request(`/issues/${id}`);
  }

  async createIssue(issueData: any) {
    return this.request('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(id: string, updates: any) {
    return this.request(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteIssue(id: string) {
    return this.request(`/issues/${id}`, { method: 'DELETE' });
  }

  async assignIssue(id: string, assignedTo: string) {
    return this.request(`/issues/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo }),
    });
  }

  async addComment(issueId: string, content: string) {
    return this.request(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async addInternalComment(issueId: string, content: string) {
    return this.request(`/issues/${issueId}/internal-comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Analytics endpoints
  async getDashboardMetrics() {
    return this.request('/analytics/dashboard');
  }

  async getIssueAnalytics(timeframe?: string) {
    const params = timeframe ? `?timeframe=${timeframe}` : '';
    return this.request(`/analytics/issues${params}`);
  }

  // Notification endpoints
  async getNotifications() {
    return this.request('/notifications');
  }

  async getUnreadCount() {
    return this.request('/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllNotificationsAsRead() {
    return this.request('/notifications/mark-all-read', { method: 'POST' });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
