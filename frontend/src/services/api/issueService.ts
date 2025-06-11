
import { apiCall } from '@/config/api';
import { Issue, Comment } from '@/types';

export interface IssueCreateData {
  title: string;
  description: string;
  issue_type: string;
  issue_subtype: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  employee_id: string;
  additional_details?: any;
}

export interface IssueUpdateData {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolution_notes?: string;
}

export interface IssueFilters {
  status?: string | string[];
  priority?: string | string[];
  issue_type?: string;
  assigned_to?: string;
  created_by?: string;
  cluster_id?: string;
  city_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export const issueService = {
  // Get all issues with filters
  getIssues: async (filters?: IssueFilters): Promise<Issue[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const endpoint = `/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data || [];
  },

  // Get issue by ID
  getIssueById: async (id: string): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}`);
    return response.data;
  },

  // Create new issue
  createIssue: async (issueData: IssueCreateData): Promise<Issue> => {
    const response = await apiCall('/issues', {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
    return response.data;
  },

  // Update issue
  updateIssue: async (id: string, updateData: IssueUpdateData): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return response.data;
  },

  // Delete issue
  deleteIssue: async (id: string): Promise<void> => {
    await apiCall(`/issues/${id}`, {
      method: 'DELETE',
    });
  },

  // Update issue status
  updateIssueStatus: async (id: string, status: string): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return response.data;
  },

  // Assign issue
  assignIssue: async (id: string, assignedTo: string): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assigned_to: assignedTo }),
    });
    return response.data;
  },

  // Update issue priority
  updateIssuePriority: async (id: string, priority: string): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
    return response.data;
  },

  // Reopen issue
  reopenIssue: async (id: string): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}/reopen`, {
      method: 'POST',
    });
    return response.data;
  },

  // Escalate issue
  escalateIssue: async (id: string): Promise<Issue> => {
    const response = await apiCall(`/issues/${id}/escalate`, {
      method: 'POST',
    });
    return response.data;
  },

  // Get issue comments
  getIssueComments: async (id: string): Promise<{ public_comments: Comment[]; internal_comments: Comment[] }> => {
    const response = await apiCall(`/issues/${id}/comments`);
    return response.data;
  },

  // Add comment to issue
  addComment: async (id: string, content: string): Promise<Comment> => {
    const response = await apiCall(`/issues/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response.data;
  },

  // Update comment
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    const response = await apiCall(`/issues/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
    return response.data;
  },

  // Delete comment
  deleteComment: async (commentId: string): Promise<void> => {
    await apiCall(`/issues/comments/${commentId}`, {
      method: 'DELETE',
    });
  },

  // Get issue statistics
  getIssueStatistics: async (): Promise<any> => {
    const response = await apiCall('/issues/stats/overview');
    return response.data;
  },

  // Get issue trends
  getIssueTrends: async (): Promise<any> => {
    const response = await apiCall('/issues/stats/trends');
    return response.data;
  },

  // Get audit trail for issue
  getIssueAuditTrail: async (id: string): Promise<any[]> => {
    const response = await apiCall(`/issues/${id}/audit`);
    return response.data || [];
  },
};
