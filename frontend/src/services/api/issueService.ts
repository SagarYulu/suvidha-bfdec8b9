
import { apiCall } from '@/config/api';
import { Issue, Comment } from '@/types';

export const issueService = {
  // Get all issues
  getIssues: async (filters?: any): Promise<Issue[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const url = `/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return await apiCall(url);
  },

  // Get issue by ID
  getIssueById: async (id: string): Promise<Issue> => {
    return await apiCall(`/issues/${id}`);
  },

  // Create new issue
  createIssue: async (issueData: Partial<Issue>): Promise<Issue> => {
    return await apiCall('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
  },

  // Update issue
  updateIssue: async (id: string, issueData: Partial<Issue>): Promise<Issue> => {
    return await apiCall(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(issueData),
    });
  },

  // Delete issue
  deleteIssue: async (id: string): Promise<void> => {
    await apiCall(`/issues/${id}`, {
      method: 'DELETE',
    });
  },

  // Add comment to issue
  addComment: async (issueId: string, commentData: { content: string; isInternal?: boolean }): Promise<Comment> => {
    return await apiCall(`/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    });
  },

  // Get issue comments
  getComments: async (issueId: string): Promise<Comment[]> => {
    return await apiCall(`/issues/${issueId}/comments`);
  },

  // Update issue status
  updateStatus: async (id: string, status: Issue['status']): Promise<Issue> => {
    return await apiCall(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Assign issue
  assignIssue: async (id: string, assignedTo: string): Promise<Issue> => {
    return await apiCall(`/issues/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
  },
};

// Backward compatibility exports
export const getIssues = issueService.getIssues;
export const getIssueById = issueService.getIssueById;
export const createIssue = issueService.createIssue;
export const updateIssue = issueService.updateIssue;
export const deleteIssue = issueService.deleteIssue;
export const addComment = issueService.addComment;
export const getComments = issueService.getComments;
