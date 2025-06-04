
// Real API service for windsurf backend
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth API
  async login(credentials: { email: string; password: string }) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async logout() {
    return this.request('/api/auth/logout', { method: 'POST' });
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

  // Analytics API
  async getAnalytics() {
    return this.request('/api/analytics');
  }

  // Export API
  async exportData(entityType: string, format: string, filters: any = {}) {
    const queryString = new URLSearchParams({ format, ...filters }).toString();
    const response = await fetch(`${API_BASE_URL}/api/export/${entityType}?${queryString}`, {
      headers: this.getAuthHeaders(),
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
}

export const apiService = new ApiService();
