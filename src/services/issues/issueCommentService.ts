
import { api } from '../../lib/api';

export const addNewComment = async (issueId: string, content: string, employeeUuid: string) => {
  try {
    const response = await api.post(`/issues/${issueId}/comments`, {
      content,
      employeeUuid
    });
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

// Add alias for backwards compatibility
export const addComment = addNewComment;

export const getComments = async (issueId: string) => {
  try {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};
