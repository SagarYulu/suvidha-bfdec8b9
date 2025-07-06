
import { ApiClient } from '../apiClient';

interface Comment {
  id: string;
  content: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  isInternal: boolean;
}

export const issueCommentService = {
  async getComments(issueId: string): Promise<Comment[]> {
    const response = await ApiClient.get(`/api/issues/${issueId}/comments`);
    return response.data || [];
  },

  async addComment(issueId: string, content: string): Promise<Comment> {
    const response = await ApiClient.post(`/api/issues/${issueId}/comments`, {
      content
    });
    return response.data;
  },

  async updateComment(issueId: string, commentId: string, content: string): Promise<Comment> {
    const response = await ApiClient.put(`/api/issues/${issueId}/comments/${commentId}`, {
      content
    });
    return response.data;
  },

  async deleteComment(issueId: string, commentId: string): Promise<void> {
    await ApiClient.delete(`/api/issues/${issueId}/comments/${commentId}`);
  }
};
