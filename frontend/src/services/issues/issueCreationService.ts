
import { ApiClient } from '../apiClient';
import { Issue } from '@/types';

interface CreateIssueData {
  type: string;
  subType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  title?: string;
  attachments?: File[];
}

export const issueCreationService = {
  async createIssue(data: CreateIssueData): Promise<Issue> {
    const formData = new FormData();
    
    // Add basic issue data
    formData.append('type', data.type);
    formData.append('subType', data.subType);
    formData.append('priority', data.priority);
    formData.append('description', data.description);
    
    if (data.title) {
      formData.append('title', data.title);
    }

    // Add attachments if any
    if (data.attachments) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
    }

    const response = await ApiClient.post('/api/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  },

  async validateIssueData(data: Partial<CreateIssueData>): Promise<{
    isValid: boolean;
    errors: Record<string, string>;
  }> {
    const errors: Record<string, string> = {};

    if (!data.type) {
      errors.type = 'Issue type is required';
    }

    if (!data.subType) {
      errors.subType = 'Issue sub-type is required';
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!data.priority) {
      errors.priority = 'Priority is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  async getDuplicateIssues(description: string): Promise<Issue[]> {
    const response = await ApiClient.post('/api/issues/check-duplicates', {
      description
    });
    return response.data;
  },

  async getIssueTemplate(typeId: string, subTypeId: string): Promise<{
    title?: string;
    description?: string;
    suggestedPriority?: string;
  }> {
    const response = await ApiClient.get(`/api/issues/template/${typeId}/${subTypeId}`);
    return response.data;
  }
};
