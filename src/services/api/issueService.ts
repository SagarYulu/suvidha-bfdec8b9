
import { apiRequest, endpoints } from '@/config/api';
import { Issue } from '@/types';

export interface CreateIssueData {
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  priority?: string;
  attachments?: string[];
}

export interface UpdateIssueData {
  description?: string;
  priority?: string;
  status?: string;
  assignedTo?: string;
}

export interface IssueFilters {
  city?: string;
  cluster?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface IssueComment {
  id: string;
  issueId: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
}

// Issue service for backend API
export const issueService = {
  // Get all issues with optional filters
  async getIssues(filters?: IssueFilters): Promise<Issue[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.issues.list}?${queryParams.toString()}`
      : endpoints.issues.list;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },

  // Get issue by ID
  async getIssueById(id: string): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.getById(id));
    return response.data || response;
  },

  // Get issues by user ID
  async getIssuesByUserId(userId: string): Promise<Issue[]> {
    const response = await apiRequest(`${endpoints.issues.list}?employeeUuid=${userId}`);
    return response.data || response;
  },

  // Create new issue
  async createIssue(issueData: CreateIssueData): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.create, {
      method: 'POST',
      body: JSON.stringify(issueData),
    });
    
    return response.data || response;
  },

  // Update issue
  async updateIssue(id: string, updateData: UpdateIssueData): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.update(id), {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    return response.data || response;
  },

  // Update issue status
  async updateIssueStatus(id: string, status: string): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.updateStatus(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    
    return response.data || response;
  },

  // Assign issue to user
  async assignIssue(id: string, assignedTo: string): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.assign(id), {
      method: 'PATCH',
      body: JSON.stringify({ assignedTo }),
    });
    
    return response.data || response;
  },

  // Update issue priority
  async updateIssuePriority(id: string, priority: string): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.updatePriority(id), {
      method: 'PATCH',
      body: JSON.stringify({ priority }),
    });
    
    return response.data || response;
  },

  // Reopen issue
  async reopenIssue(id: string): Promise<Issue> {
    const response = await apiRequest(endpoints.issues.reopen(id), {
      method: 'POST',
    });
    
    return response.data || response;
  },

  // Get issue comments
  async getIssueComments(issueId: string): Promise<IssueComment[]> {
    const response = await apiRequest(endpoints.issues.comments(issueId));
    return response.data || response;
  },

  // Add comment to issue
  async addComment(issueId: string, content: string, employeeUuid: string): Promise<IssueComment> {
    const response = await apiRequest(endpoints.issues.addComment(issueId), {
      method: 'POST',
      body: JSON.stringify({
        content,
        employeeUuid,
      }),
    });
    
    return response.data || response;
  },

  // Get issue analytics
  async getAnalytics(filters?: IssueFilters): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.issues.analytics}?${queryParams.toString()}`
      : endpoints.issues.analytics;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },
};
