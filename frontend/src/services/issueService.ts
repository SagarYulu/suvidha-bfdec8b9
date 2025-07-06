
import { ApiClient } from './apiClient';

export interface Issue {
  id: string;
  title: string;
  description: string;
  issue_type: string;
  issue_subtype: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'escalated';
  employee_id: string;
  created_by: string;
  assigned_to?: string;
  resolved_at?: string;
  additional_details?: any;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  emp_name?: string;
  emp_email?: string;
  emp_code?: string;
  cluster_name?: string;
  city_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
}

export interface CreateIssueData {
  title?: string;
  description: string;
  issue_type: string;
  issue_subtype: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  employee_id: string;
  additional_details?: any;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  resolution_notes?: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export class IssueService {
  static async getIssues(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    city?: string;
    cluster?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    issues: Issue[];
    total: number;
    page: number;
    limit: number;
    pages: number;
  }> {
    const response = await ApiClient.get('/api/issues', { params: filters });
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

  static async getIssueStats(): Promise<{
    total: number;
    open: number;
    in_progress: number;
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
