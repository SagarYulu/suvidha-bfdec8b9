
import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Issue {
  id: string;
  employee_uuid: string;
  typeId: string;
  subTypeId?: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  employee_name?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  manager_name?: string;
  assigned_to_name?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  issue_id: string;
  employee_uuid?: string;
  admin_user_id?: string;
  content: string;
  created_at: string;
  commenter_name?: string;
  admin_name?: string;
}

export interface IssueFilters {
  status?: string;
  typeId?: string;
  priority?: string;
  city?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateIssueData {
  typeId: string;
  subTypeId?: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

export const issueService = {
  // Get all issues with filters (Admin)
  getIssues: async (filters?: IssueFilters): Promise<Issue[]> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }
    
    const url = `${API_ENDPOINTS.ISSUES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    return response.issues || [];
  },

  // Get single issue by ID
  getIssueById: async (id: string): Promise<Issue> => {
    const response = await apiClient.get(`${API_ENDPOINTS.ISSUES}/${id}`);
    return response.issue;
  },

  // Create new issue (Employee)
  createIssue: async (issueData: CreateIssueData): Promise<string> => {
    const response = await apiClient.post(API_ENDPOINTS.ISSUES, issueData);
    return response.issueId;
  },

  // Update issue status
  updateIssueStatus: async (id: string, status: Issue['status']): Promise<void> => {
    await apiClient.patch(`${API_ENDPOINTS.ISSUES}/${id}/status`, { status });
  },

  // Assign issue to user
  assignIssue: async (id: string, assignedTo: string): Promise<void> => {
    await apiClient.patch(`${API_ENDPOINTS.ISSUES}/${id}/assign`, { assignedTo });
  },

  // Add comment to issue
  addComment: async (id: string, content: string): Promise<void> => {
    await apiClient.post(`${API_ENDPOINTS.ISSUES}/${id}/comments`, { content });
  },

  // Get employee's issues
  getEmployeeIssues: async (): Promise<Issue[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EMPLOYEE_ISSUES);
    return response.issues || [];
  }
};
