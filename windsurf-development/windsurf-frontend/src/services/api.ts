
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';

class ApiService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Issues API - Complete CRUD with all features
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

  async assignIssue(id: string, assigneeId: string) {
    return this.request(`/api/issues/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ assigneeId }),
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

  // Users API - Complete user management
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
  async getAnalytics(filters: any = {}) {
    const queryString = new URLSearchParams(filters).toString();
    return this.request(`/api/analytics?${queryString}`);
  }

  async getUserAnalytics(userId: string) {
    return this.request(`/api/analytics/user/${userId}`);
  }

  // Export API - Complete export functionality
  async exportData(entityType: string, format: string, filters: any = {}) {
    const queryString = new URLSearchParams({ format, ...filters }).toString();
    const token = localStorage.getItem('authToken');
    
    const response = await fetch(`${API_BASE_URL}/api/export/${entityType}?${queryString}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.split('filename=')[1]?.replace(/"/g, '') || `${entityType}-export.${format}`;
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  }

  // RBAC API - Role and permission management
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

  // Audit Trail API
  async getAuditTrail(issueId?: string, limit: number = 100) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (issueId) params.append('issueId', issueId);
    return this.request(`/api/audit/trail?${params.toString()}`);
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

  // File Upload API
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
    
    return await response.json();
  }
}

export const apiService = new ApiService();
