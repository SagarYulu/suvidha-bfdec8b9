
// Real API service for windsurf backend
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`
      };
    }

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Issues API
  async getIssues(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/issues?${queryString}`);
  }

  async getIssue(id: string) {
    return this.request(`/api/issues/${id}`);
  }

  async createIssue(issueData: any) {
    return this.request('/api/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  }

  async updateIssue(id: string, updates: any) {
    return this.request(`/api/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteIssue(id: string) {
    return this.request(`/api/issues/${id}`, {
      method: 'DELETE',
    });
  }

  async assignIssue(id: string, assignedTo: string) {
    return this.request(`/api/issues/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assignedTo }),
    });
  }

  async reopenIssue(issueId: string) {
    return this.request(`/api/issues/${issueId}/reopen`, {
      method: 'POST',
    });
  }

  // Users API
  async getUsers(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/users?${queryString}`);
  }

  async getUser(id: string) {
    return this.request(`/api/users/${id}`);
  }

  async createUser(userData: any) {
    return this.request('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: any) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/api/users/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkCreateUsers(usersData: any[]) {
    return this.request('/api/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users: usersData }),
    });
  }

  // Analytics API
  async getAnalytics() {
    return this.request('/api/analytics');
  }

  async getSentimentAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/sentiment?${queryString}`);
  }

  // Export API
  async exportData(entityType: string, format: string, filters: any = {}) {
    const queryString = new URLSearchParams({ format, ...filters }).toString();
    const response = await fetch(`${API_BASE_URL}/api/export/${entityType}?${queryString}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.split('filename=')[1] || `${entityType}-export.${format}`;
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/"/g, '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Notifications API
  async getNotifications(userId: string) {
    return this.request(`/api/notifications?userId=${userId}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async createNotification(notificationData: any) {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  // Mobile authentication (Email + Employee ID)
  async mobileLogin(email: string, employeeId: string) {
    return this.request('/api/auth/mobile/login', {
      method: 'POST',
      body: JSON.stringify({ email, employeeId }),
    });
  }

  // Admin authentication (Email + Password)
  async adminLogin(email: string, password: string) {
    return this.request('/api/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Comments API
  async addComment(issueId: string, content: string) {
    return this.request(`/api/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async addInternalComment(issueId: string, content: string) {
    return this.request(`/api/issues/${issueId}/internal-comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Feedback API
  async submitFeedback(feedbackData: any) {
    return this.request('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(feedbackData),
    });
  }

  async getFeedback(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/feedback?${queryString}`);
  }

  // File Upload API
  async uploadFile(file: File, issueId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (issueId) {
      formData.append('issueId', issueId);
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return await response.json();
  }

  // Master Data API
  async getIssueTypes() {
    return this.request('/api/master/issue-types');
  }

  async getCities() {
    return this.request('/api/master/cities');
  }

  async getClusters(cityId?: string) {
    const params = cityId ? `?cityId=${cityId}` : '';
    return this.request(`/api/master/clusters${params}`);
  }

  async getRoles() {
    return this.request('/api/master/roles');
  }

  // Real-time connection endpoint
  getRealtimeUrl() {
    const token = localStorage.getItem('authToken');
    return `${API_BASE_URL}/api/realtime/stream?token=${token}`;
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiService = new ApiService();
