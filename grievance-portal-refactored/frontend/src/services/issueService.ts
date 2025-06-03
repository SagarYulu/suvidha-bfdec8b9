
import apiService from './api';

export interface Issue {
  id: string;
  employee_uuid: string;
  type_id: string;
  sub_type_id: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  closed_at?: string;
  assigned_to?: string;
  employee_name?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  manager_name?: string;
  assigned_to_name?: string;
  attachment_url?: string;
  attachments?: string[];
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
  priority?: string;
  typeId?: string;
  city?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateIssueData {
  typeId: string;
  subTypeId: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  attachment?: File;
}

class IssueService {
  async getIssues(filters?: IssueFilters): Promise<Issue[]> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }
    
    const url = `/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiService.get<{ success: boolean; issues: Issue[] }>(url);
    
    return response.issues || [];
  }

  async getIssueById(id: string): Promise<Issue> {
    const response = await apiService.get<{ success: boolean; issue: Issue }>(`/issues/${id}`);
    return response.issue;
  }

  async createIssue(issueData: CreateIssueData): Promise<string> {
    const formData = new FormData();
    formData.append('typeId', issueData.typeId);
    formData.append('subTypeId', issueData.subTypeId);
    formData.append('description', issueData.description);
    
    if (issueData.priority) {
      formData.append('priority', issueData.priority);
    }
    
    if (issueData.attachment) {
      formData.append('attachment', issueData.attachment);
    }

    const response = await apiService.post<{ success: boolean; issueId: string }>(
      '/issues',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.issueId;
  }

  async updateIssueStatus(id: string, status: Issue['status']): Promise<void> {
    await apiService.patch(`/issues/${id}/status`, { status });
  }

  async assignIssue(id: string, assignedTo: string): Promise<void> {
    await apiService.patch(`/issues/${id}/assign`, { assignedTo });
  }

  async addComment(id: string, content: string): Promise<void> {
    await apiService.post(`/issues/${id}/comments`, { content });
  }

  async getEmployeeIssues(): Promise<Issue[]> {
    const response = await apiService.get<{ success: boolean; issues: Issue[] }>('/issues/employee/my-issues');
    return response.issues || [];
  }
}

export const issueService = new IssueService();
export default issueService;
