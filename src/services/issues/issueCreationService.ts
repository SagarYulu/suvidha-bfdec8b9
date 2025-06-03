
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';
import { Issue } from '../../types';

export const createIssue = async (issueData: Partial<Issue>): Promise<Issue | null> => {
  try {
    const response = await api.post(API_ENDPOINTS.ISSUES, issueData);
    return response.data;
  } catch (error) {
    console.error('Error in createIssue:', error);
    return null;
  }
};
