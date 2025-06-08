
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
    return this.request('/api/bulk-users/create', {
      method: 'POST',
      body: JSON.stringify({ users: usersData }),
    });
  }

  // Analytics API
  async getDashboardMetrics() {
    return this.request('/api/analytics/dashboard');
  }

  async getIssueAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/issues?${queryString}`);
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
  async getNotifications() {
    return this.request('/api/notifications');
  }

  async getUnreadCount() {
    return this.request('/api/notifications/unread-count');
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/api/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/api/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Authentication API
  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  async refreshToken(token: string) {
    return this.request('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
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

  async getFeedbackAnalytics(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/api/feedback/analytics?${queryString}`);
  }

  async getFeedback(id: string) {
    return this.request(`/api/feedback/${id}`);
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
  async getRoles() {
    return this.request('/api/master/roles');
  }

  async createRole(name: string) {
    return this.request('/api/master/roles', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateRole(id: string, name: string) {
    return this.request(`/api/master/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteRole(id: string) {
    return this.request(`/api/master/roles/${id}`, {
      method: 'DELETE',
    });
  }

  async getCities() {
    return this.request('/api/master/cities');
  }

  async createCity(name: string) {
    return this.request('/api/master/cities', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async updateCity(id: string, name: string) {
    return this.request(`/api/master/cities/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async deleteCity(id: string) {
    return this.request(`/api/master/cities/${id}`, {
      method: 'DELETE',
    });
  }

  async getClusters(cityId?: string) {
    const params = cityId ? `?cityId=${cityId}` : '';
    return this.request(`/api/master/clusters${params}`);
  }

  async createCluster(name: string, cityId: string) {
    return this.request('/api/master/clusters', {
      method: 'POST',
      body: JSON.stringify({ name, cityId }),
    });
  }

  async updateCluster(id: string, name: string, cityId: string) {
    return this.request(`/api/master/clusters/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, cityId }),
    });
  }

  async deleteCluster(id: string) {
    return this.request(`/api/master/clusters/${id}`, {
      method: 'DELETE',
    });
  }

  async getAuditLogs(entityType?: string) {
    const params = entityType ? `?entityType=${entityType}` : '';
    return this.request(`/api/master/audit-logs${params}`);
  }

  // RBAC API
  async getUserPermissions(userId: string) {
    return this.request(`/api/rbac/users/${userId}/permissions`);
  }

  async getUserRoles(userId: string) {
    return this.request(`/api/rbac/users/${userId}/roles`);
  }

  async assignRole(userId: string, roleId: string) {
    return this.request('/api/rbac/assign-role', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  }

  async removeRole(userId: string, roleId: string) {
    return this.request('/api/rbac/remove-role', {
      method: 'POST',
      body: JSON.stringify({ userId, roleId }),
    });
  }

  async getAllRoles() {
    return this.request('/api/rbac/roles');
  }

  async getAllPermissions() {
    return this.request('/api/rbac/permissions');
  }

  // Bulk Users API
  async validateBulkUsers(users: any[]) {
    return this.request('/api/bulk-users/validate', {
      method: 'POST',
      body: JSON.stringify({ users }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiService = new ApiService();
