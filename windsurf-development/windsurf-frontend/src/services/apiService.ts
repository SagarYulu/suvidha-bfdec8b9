
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
    const response = await fetch(`${API_BASE_URL}/api/export/${entityType}?${queryString}`);
    
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
