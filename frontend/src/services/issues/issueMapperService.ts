
import { ApiClient } from '../apiClient';

interface MappingData {
  mappedTypeId: string;
  mappedSubTypeId: string;
  reason?: string;
}

export const issueMapperService = {
  async mapIssue(issueId: string, mappingData: MappingData): Promise<void> {
    await ApiClient.patch(`/api/issues/${issueId}/map`, mappingData);
  },

  async unmapIssue(issueId: string, reason?: string): Promise<void> {
    await ApiClient.patch(`/api/issues/${issueId}/unmap`, { reason });
  },

  async getMappingSuggestions(issueId: string): Promise<Array<{
    typeId: string;
    subTypeId: string;
    confidence: number;
    reason: string;
  }>> {
    const response = await ApiClient.get(`/api/issues/${issueId}/mapping-suggestions`);
    return response.data;
  },

  async getMappingHistory(issueId: string): Promise<Array<{
    id: string;
    previousTypeId?: string;
    previousSubTypeId?: string;
    newTypeId: string;
    newSubTypeId: string;
    mappedBy: string;
    mappedAt: string;
    reason?: string;
  }>> {
    const response = await ApiClient.get(`/api/issues/${issueId}/mapping-history`);
    return response.data;
  },

  async bulkMap(issueIds: string[], mappingData: MappingData): Promise<{
    successful: string[];
    failed: Array<{ issueId: string; error: string }>;
  }> {
    const response = await ApiClient.post('/api/issues/bulk/map', {
      issueIds,
      mappingData
    });
    return response.data;
  },

  async validateMapping(typeId: string, subTypeId: string): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const response = await ApiClient.post('/api/issues/validate-mapping', {
      typeId,
      subTypeId
    });
    return response.data;
  }
};
