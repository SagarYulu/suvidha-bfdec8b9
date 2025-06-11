
import { ApiClient } from '../apiClient';

interface StatusUpdateData {
  status: string;
  reason?: string;
  assignTo?: string;
  priority?: string;
}

export const issueStatusService = {
  async updateStatus(issueId: string, data: StatusUpdateData): Promise<void> {
    await ApiClient.patch(`/api/issues/${issueId}/status`, data);
  },

  async getAvailableStatuses(currentStatus: string): Promise<Array<{
    status: string;
    label: string;
    description: string;
    requiresReason: boolean;
  }>> {
    const response = await ApiClient.get(`/api/issues/available-statuses/${currentStatus}`);
    return response.data;
  },

  async getStatusHistory(issueId: string): Promise<Array<{
    id: string;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }>> {
    const response = await ApiClient.get(`/api/issues/${issueId}/status-history`);
    return response.data;
  },

  async bulkUpdateStatus(issueIds: string[], data: StatusUpdateData): Promise<{
    successful: string[];
    failed: Array<{ issueId: string; error: string }>;
  }> {
    const response = await ApiClient.post('/api/issues/bulk/status', {
      issueIds,
      ...data
    });
    return response.data;
  },

  async getStatusTransitionRules(): Promise<Record<string, string[]>> {
    const response = await ApiClient.get('/api/issues/status-transitions');
    return response.data;
  },

  async validateStatusTransition(currentStatus: string, newStatus: string): Promise<{
    isValid: boolean;
    reason?: string;
  }> {
    const response = await ApiClient.post('/api/issues/validate-status-transition', {
      currentStatus,
      newStatus
    });
    return response.data;
  }
};
