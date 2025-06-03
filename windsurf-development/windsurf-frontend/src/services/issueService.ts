
import { apiService } from './api';
import type { Issue, Comment, PaginatedResponse } from '@/types';

export const issueService = {
  async getIssues(params: any = {}): Promise<PaginatedResponse<Issue>> {
    return apiService.getIssues(params);
  },

  async getIssue(id: string): Promise<{ issue: Issue }> {
    return apiService.getIssue(id);
  },

  async createIssue(issueData: Partial<Issue>): Promise<{ issueId: string; message: string }> {
    return apiService.createIssue(issueData);
  },

  async updateIssue(id: string, updates: Partial<Issue>): Promise<{ message: string }> {
    return apiService.updateIssue(id, updates);
  },

  async addComment(issueId: string, content: string): Promise<{ commentId: string; message: string }> {
    return apiService.addComment(issueId, content);
  },

  async addInternalComment(issueId: string, content: string): Promise<{ commentId: string; message: string }> {
    return apiService.addInternalComment(issueId, content);
  }
};
