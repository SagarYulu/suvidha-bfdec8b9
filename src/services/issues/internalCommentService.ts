
import { api } from '../../lib/api';

export interface InternalComment {
  id: string;
  issueId: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
}

export const getInternalComments = async (issueId: string): Promise<InternalComment[]> => {
  try {
    const response = await api.get(`/issues/${issueId}/internal-comments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching internal comments:', error);
    return [];
  }
};

export const addInternalComment = async (
  issueId: string, 
  employeeUuid: string, 
  content: string
): Promise<InternalComment | null> => {
  try {
    const response = await api.post(`/issues/${issueId}/internal-comments`, {
      employeeUuid,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error adding internal comment:', error);
    return null;
  }
};
