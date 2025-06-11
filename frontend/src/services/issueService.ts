
import { ApiClient } from './apiClient';
import { Issue, CreateIssueData, UpdateIssueData, IssueComment, TicketFeedback } from '../types';

export class IssueService {
  static async getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    city?: string;
    cluster?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Issue[]> {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    
    const response = await ApiClient.get(`/api/issues?${queryParams}`);
    return response.data;
  }

  static async getIssueById(id: string): Promise<Issue> {
    const response = await ApiClient.get(`/api/issues/${id}`);
    return response.data;
  }

  static async createIssue(data: CreateIssueData): Promise<Issue> {
    const response = await ApiClient.post('/api/issues', data);
    return response.data;
  }

  static async updateIssue(id: string, data: UpdateIssueData): Promise<Issue> {
    const response = await ApiClient.put(`/api/issues/${id}`, data);
    return response.data;
  }

  static async deleteIssue(id: string): Promise<void> {
    await ApiClient.delete(`/api/issues/${id}`);
  }

  static async addComment(issueId: string, content: string): Promise<IssueComment> {
    const response = await ApiClient.post(`/api/issues/${issueId}/comments`, { content });
    return response.data;
  }

  static async submitFeedback(issueId: string, data: {
    sentiment: 'happy' | 'neutral' | 'sad';
    feedbackOption: string;
  }): Promise<TicketFeedback> {
    const response = await ApiClient.post(`/api/issues/${issueId}/feedback`, data);
    return response.data;
  }

  static async getIssueStats(): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    avgResolutionTime: number;
  }> {
    const response = await ApiClient.get('/api/issues/stats');
    return response.data;
  }

  static async updateIssueStatus(id: string, status: string): Promise<Issue> {
    const response = await ApiClient.patch(`/api/issues/${id}/status`, { status });
    return response.data;
  }

  static async assignIssue(id: string, assignedTo: string): Promise<Issue> {
    const response = await ApiClient.patch(`/api/issues/${id}/assign`, { assigned_to: assignedTo });
    return response.data;
  }

  static async reopenIssue(id: string): Promise<Issue> {
    const response = await ApiClient.post(`/api/issues/${id}/reopen`);
    return response.data;
  }

  static async escalateIssue(id: string, reason?: string): Promise<Issue> {
    const response = await ApiClient.post(`/api/issues/${id}/escalate`, { reason });
    return response.data;
  }
}
