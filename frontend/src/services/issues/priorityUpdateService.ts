
import { ApiClient } from '../apiClient';

interface PriorityUpdateData {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason?: string;
}

export const priorityUpdateService = {
  async updatePriority(issueId: string, data: PriorityUpdateData): Promise<void> {
    await ApiClient.patch(`/api/issues/${issueId}/priority`, data);
  },

  async bulkUpdatePriority(issueIds: string[], data: PriorityUpdateData): Promise<{
    successful: string[];
    failed: Array<{ issueId: string; error: string }>;
  }> {
    const response = await ApiClient.post('/api/issues/bulk/priority', {
      issueIds,
      ...data
    });
    return response.data;
  },

  async getPriorityHistory(issueId: string): Promise<Array<{
    id: string;
    previousPriority: string;
    newPriority: string;
    changedBy: string;
    changedAt: string;
    reason?: string;
  }>> {
    const response = await ApiClient.get(`/api/issues/${issueId}/priority-history`);
    return response.data;
  },

  async getPriorityRecommendation(issueId: string): Promise<{
    recommendedPriority: string;
    confidence: number;
    factors: Array<{
      factor: string;
      weight: number;
      description: string;
    }>;
  }> {
    const response = await ApiClient.get(`/api/issues/${issueId}/priority-recommendation`);
    return response.data;
  },

  async validatePriorityChange(currentPriority: string, newPriority: string): Promise<{
    isValid: boolean;
    warning?: string;
  }> {
    const response = await ApiClient.post('/api/issues/validate-priority-change', {
      currentPriority,
      newPriority
    });
    return response.data;
  }
};
