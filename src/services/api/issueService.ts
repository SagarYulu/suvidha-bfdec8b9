
import apiRequest from '@/config/api';

export interface Issue {
  id: string;
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  assignedTo?: string;
  escalation_level?: number;
  escalated_at?: string;
  cluster?: string;
  city?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  issueId: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
  employee_name?: string;
  isInternal?: boolean;
}

export interface IssueFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  city?: string;
  cluster?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateIssueRequest {
  typeId: string;
  subTypeId: string;
  description: string;
  priority: string;
  attachments?: File[];
}

export const issueService = {
  // Get all issues with filters
  async getIssues(filters: IssueFilters = {}): Promise<Issue[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<Issue[]>(`/issues?${params.toString()}`);
  },

  // Get single issue by ID
  async getIssue(id: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}`);
  },

  // Create new issue
  async createIssue(issueData: CreateIssueRequest): Promise<Issue> {
    const formData = new FormData();
    Object.entries(issueData).forEach(([key, value]) => {
      if (key === 'attachments' && Array.isArray(value)) {
        value.forEach((file) => formData.append('attachments', file));
      } else if (value) {
        formData.append(key, value.toString());
      }
    });

    return apiRequest<Issue>('/issues', {
      method: 'POST',
      body: formData,
      headers: {}, // Don't set Content-Type for FormData
    });
  },

  // Update issue status
  async updateIssueStatus(id: string, status: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Assign issue
  async assignIssue(id: string, assignedTo: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
  },

  // Get assigned issues
  async getAssignedIssues(userId: string): Promise<Issue[]> {
    return apiRequest<Issue[]>(`/issues/assigned/${userId}`);
  },

  // Get employee issues
  async getEmployeeIssues(employeeId: string): Promise<Issue[]> {
    return apiRequest<Issue[]>(`/issues/employee/${employeeId}`);
  },

  // Add comment
  async addComment(issueId: string, content: string, isInternal = false): Promise<Comment> {
    const endpoint = isInternal ? `/issues/${issueId}/internal-comments` : `/issues/${issueId}/comments`;
    return apiRequest<Comment>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Get comments
  async getComments(issueId: string): Promise<{ public_comments: Comment[], internal_comments: Comment[] }> {
    return apiRequest<{ public_comments: Comment[], internal_comments: Comment[] }>(`/issues/${issueId}/comments`);
  },

  // Escalate issue
  async escalateIssue(id: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/escalate`, {
      method: 'POST',
    });
  },

  // Map issue type (for "others" issues)
  async mapIssueType(id: string, typeId: string, subTypeId: string): Promise<Issue> {
    return apiRequest<Issue>(`/issues/${id}/map-type`, {
      method: 'PATCH',
      body: JSON.stringify({ typeId, subTypeId }),
    });
  }
};
