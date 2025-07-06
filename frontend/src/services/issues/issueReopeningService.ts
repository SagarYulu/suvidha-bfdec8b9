
import { ApiClient } from '../apiClient';

interface ReopenData {
  reason: string;
  newPriority?: string;
  assignTo?: string;
}

export const issueReopeningService = {
  async reopenIssue(issueId: string, data: ReopenData): Promise<void> {
    await ApiClient.post(`/api/issues/${issueId}/reopen`, data);
  },

  async canReopen(issueId: string): Promise<{
    canReopen: boolean;
    reason?: string;
  }> {
    const response = await ApiClient.get(`/api/issues/${issueId}/can-reopen`);
    return response.data;
  },

  async getReopenReasons(): Promise<Array<{
    id: string;
    label: string;
    description: string;
  }>> {
    const response = await ApiClient.get('/api/issues/reopen-reasons');
    return response.data;
  },

  async getReopenHistory(issueId: string): Promise<Array<{
    id: string;
    reopenedBy: string;
    reopenedAt: string;
    reason: string;
    previousStatus: string;
    newStatus: string;
  }>> {
    const response = await ApiClient.get(`/api/issues/${issueId}/reopen-history`);
    return response.data;
  },

  async bulkReopen(issueIds: string[], data: ReopenData): Promise<{
    successful: string[];
    failed: Array<{ issueId: string; error: string }>;
  }> {
    const response = await ApiClient.post('/api/issues/bulk/reopen', {
      issueIds,
      ...data
    });
    return response.data;
  }
};
