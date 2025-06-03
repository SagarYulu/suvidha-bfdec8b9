
import { api } from '../../lib/api';
import { API_ENDPOINTS } from '../../config/api';

export const addNewComment = async (issueId: string, commentData: any) => {
  try {
    const response = await api.post(`${API_ENDPOINTS.ISSUES}/${issueId}/comments`, commentData);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};
