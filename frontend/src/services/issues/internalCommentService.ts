
import { ApiClient } from '../apiClient';

interface InternalComment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  visibility: 'internal' | 'admin_only';
}

export const internalCommentService = {
  async getInternalComments(issueId: string): Promise<InternalComment[]> {
    const response = await ApiClient.get(`/api/issues/${issueId}/internal-comments`);
    return response.data || [];
  },

  async addInternalComment(
    issueId: string, 
    content: string, 
    visibility: 'internal' | 'admin_only'
  ): Promise<InternalComment> {
    const response = await ApiClient.post(`/api/issues/${issueId}/internal-comments`, {
      content,
      visibility
    });
    return response.data;
  },

  async updateInternalComment(
    issueId: string,
    commentId: string,
    content: string,
    visibility: 'internal' | 'admin_only'
  ): Promise<InternalComment> {
    const response = await ApiClient.put(`/api/issues/${issueId}/internal-comments/${commentId}`, {
      content,
      visibility
    });
    return response.data;
  },

  async deleteInternalComment(issueId: string, commentId: string): Promise<void> {
    await ApiClient.delete(`/api/issues/${issueId}/internal-comments/${commentId}`);
  }
};
