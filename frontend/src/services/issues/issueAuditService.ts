
import { ApiClient } from '../apiClient';

interface AuditEntry {
  id: string;
  issueId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  oldValue?: any;
  newValue?: any;
  details?: Record<string, any>;
}

export const issueAuditService = {
  async getAuditTrail(issueId: string): Promise<AuditEntry[]> {
    const response = await ApiClient.get(`/api/issues/${issueId}/audit`);
    return response.data;
  },

  async logAction(issueId: string, action: string, details?: Record<string, any>): Promise<void> {
    await ApiClient.post(`/api/issues/${issueId}/audit`, {
      action,
      details
    });
  },

  async getSystemAuditTrail(filters?: {
    startDate?: string;
    endDate?: string;
    action?: string;
    performedBy?: string;
  }): Promise<AuditEntry[]> {
    const response = await ApiClient.get('/api/audit/system', {
      params: filters
    });
    return response.data;
  },

  async exportAuditTrail(issueId: string): Promise<void> {
    await ApiClient.downloadFile(
      `/api/issues/${issueId}/audit/export`,
      `audit-trail-${issueId}.csv`
    );
  }
};
