
import { apiClient } from '@/utils/apiClient';
import { Issue, User, IssueFilters, Analytics } from '@/types';

class ApiService {
  // Authentication
  async login(credentials: { email: string; password: string }) {
    return apiClient.post('/api/auth/login', credentials);
  }

  async mobileLogin(credentials: { email: string; employeeId: string }) {
    return apiClient.post('/api/auth/mobile-login', credentials);
  }

  async logout() {
    return apiClient.post('/api/auth/logout');
  }

  async getCurrentUser() {
    return apiClient.get('/api/auth/me');
  }

  // Issues
  async getIssues(filters?: IssueFilters) {
    return apiClient.get('/api/issues', filters);
  }

  async getIssue(id: string) {
    return apiClient.get(`/api/issues/${id}`);
  }

  async createIssue(issueData: Partial<Issue>) {
    return apiClient.post('/api/issues', issueData);
  }

  async updateIssue(id: string, updates: Partial<Issue>) {
    return apiClient.put(`/api/issues/${id}`, updates);
  }

  async deleteIssue(id: string) {
    return apiClient.delete(`/api/issues/${id}`);
  }

  async assignIssue(id: string, assignedTo: string) {
    return apiClient.post(`/api/issues/${id}/assign`, { assignedTo });
  }

  async addComment(issueId: string, content: string) {
    return apiClient.post(`/api/issues/${issueId}/comments`, { content });
  }

  async addInternalComment(issueId: string, content: string) {
    return apiClient.post(`/api/issues/${issueId}/internal-comments`, { content });
  }

  async getAuditTrail(issueId: string) {
    return apiClient.get(`/api/issues/${issueId}/audit-trail`);
  }

  // Users
  async getUsers(filters?: any) {
    return apiClient.get('/api/users', filters);
  }

  async createUser(userData: Partial<User>) {
    return apiClient.post('/api/users', userData);
  }

  async updateUser(id: string, updates: Partial<User>) {
    return apiClient.put(`/api/users/${id}`, updates);
  }

  async deleteUser(id: string) {
    return apiClient.delete(`/api/users/${id}`);
  }

  // Analytics
  async getAnalytics(filters?: any) {
    return apiClient.get('/api/analytics', filters);
  }

  // Dashboard stats
  async getDashboardStats() {
    return apiClient.get('/api/dashboard/stats');
  }
}

export const apiService = new ApiService();
export default apiService;
