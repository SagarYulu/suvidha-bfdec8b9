
import { ApiClient } from '../apiClient';
import { Issue } from '@/types';

interface FetchOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export const issueFetchService = {
  async getIssues(options: FetchOptions = {}): Promise<{
    issues: Issue[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const response = await ApiClient.get('/api/issues', {
      params: options
    });
    return response.data;
  },

  async getIssueById(id: string): Promise<Issue> {
    const response = await ApiClient.get(`/api/issues/${id}`);
    return response.data;
  },

  async getMyIssues(options: FetchOptions = {}): Promise<Issue[]> {
    const response = await ApiClient.get('/api/issues/my-issues', {
      params: options
    });
    return response.data;
  },

  async getAssignedIssues(assigneeId: string, options: FetchOptions = {}): Promise<Issue[]> {
    const response = await ApiClient.get(`/api/issues/assigned/${assigneeId}`, {
      params: options
    });
    return response.data;
  },

  async getRecentIssues(limit: number = 10): Promise<Issue[]> {
    const response = await ApiClient.get('/api/issues/recent', {
      params: { limit }
    });
    return response.data;
  },

  async searchIssues(query: string, options: FetchOptions = {}): Promise<Issue[]> {
    const response = await ApiClient.get('/api/issues/search', {
      params: { q: query, ...options }
    });
    return response.data;
  },

  async getIssuesByStatus(status: string, options: FetchOptions = {}): Promise<Issue[]> {
    const response = await ApiClient.get(`/api/issues/status/${status}`, {
      params: options
    });
    return response.data;
  },

  async getIssuesByPriority(priority: string, options: FetchOptions = {}): Promise<Issue[]> {
    const response = await ApiClient.get(`/api/issues/priority/${priority}`, {
      params: options
    });
    return response.data;
  }
};
