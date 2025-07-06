
import { ApiClient } from '../apiClient';

export const issueAssignmentService = {
  async assignIssue(issueId: string, assignedTo: string): Promise<void> {
    await ApiClient.patch(`/api/issues/${issueId}/assign`, {
      assignedTo
    });
  },

  async unassignIssue(issueId: string): Promise<void> {
    await ApiClient.patch(`/api/issues/${issueId}/assign`, {
      assignedTo: null
    });
  },

  async getAssignableUsers(): Promise<Array<{id: string, name: string, role: string}>> {
    const response = await ApiClient.get('/api/users/assignable');
    return response.data;
  },

  async bulkAssign(issueIds: string[], assignedTo: string): Promise<void> {
    await ApiClient.post('/api/issues/bulk/assign', {
      issueIds,
      assignedTo
    });
  },

  async getAssignmentHistory(issueId: string): Promise<Array<{
    id: string;
    assignedTo: string;
    assignedBy: string;
    assignedAt: string;
    unassignedAt?: string;
  }>> {
    const response = await ApiClient.get(`/api/issues/${issueId}/assignment-history`);
    return response.data;
  }
};
