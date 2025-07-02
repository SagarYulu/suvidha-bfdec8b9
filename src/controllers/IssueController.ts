import { ApiClient } from '@/services/ApiClient';
import { 
  Issue, 
  CreateIssueData, 
  UpdateIssueData, 
  IssueFilters, 
  IssueComment, 
  CreateCommentData,
  IssueAuditEntry,
  IssueAnalytics
} from '@/models/Issue';
import { ApiResponse, PaginatedResponse } from '@/models/ApiResponse';

export class IssueController {
  private static instance: IssueController;

  public static getInstance(): IssueController {
    if (!IssueController.instance) {
      IssueController.instance = new IssueController();
    }
    return IssueController.instance;
  }

  async getIssues(filters?: IssueFilters): Promise<PaginatedResponse<Issue>> {
    try {
      const response = await ApiClient.get('/api/issues', {
        params: filters
      });

      return {
        success: true,
        data: response.data.issues || [],
        message: 'Issues fetched successfully',
        pagination: response.data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch issues',
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      };
    }
  }

  async getIssueById(id: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.get(`/api/issues/${id}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Issue fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch issue',
        data: null
      };
    }
  }

  async createIssue(issueData: CreateIssueData): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.post('/api/issues', issueData);
      
      return {
        success: true,
        data: response.data,
        message: 'Issue created successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create issue',
        data: null
      };
    }
  }

  async updateIssue(id: string, updateData: UpdateIssueData): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.put(`/api/issues/${id}`, updateData);
      
      return {
        success: true,
        data: response.data,
        message: 'Issue updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update issue',
        data: null
      };
    }
  }

  async updateIssueStatus(id: string, status: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.patch(`/api/issues/${id}/status`, { status });
      
      return {
        success: true,
        data: response.data,
        message: 'Issue status updated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update issue status',
        data: null
      };
    }
  }

  async assignIssue(id: string, assignedTo: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.patch(`/api/issues/${id}/assign`, { assignedTo });
      
      return {
        success: true,
        data: response.data,
        message: 'Issue assigned successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to assign issue',
        data: null
      };
    }
  }

  async reopenIssue(id: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.post(`/api/issues/${id}/reopen`);
      
      return {
        success: true,
        data: response.data,
        message: 'Issue reopened successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to reopen issue',
        data: null
      };
    }
  }

  async escalateIssue(id: string, reason?: string): Promise<ApiResponse<Issue>> {
    try {
      const response = await ApiClient.post(`/api/issues/${id}/escalate`, { reason });
      
      return {
        success: true,
        data: response.data,
        message: 'Issue escalated successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to escalate issue',
        data: null
      };
    }
  }

  async getIssueComments(issueId: string): Promise<ApiResponse<IssueComment[]>> {
    try {
      const response = await ApiClient.get(`/api/issues/${issueId}/comments`);
      
      return {
        success: true,
        data: response.data,
        message: 'Comments fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch comments',
        data: []
      };
    }
  }

  async addComment(commentData: CreateCommentData): Promise<ApiResponse<IssueComment>> {
    try {
      const response = await ApiClient.post(`/api/issues/${commentData.issueId}/comments`, {
        content: commentData.content,
        isInternal: commentData.isInternal
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Comment added successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add comment',
        data: null
      };
    }
  }

  async getIssueAuditTrail(issueId: string): Promise<ApiResponse<IssueAuditEntry[]>> {
    try {
      const response = await ApiClient.get(`/api/issues/${issueId}/audit`);
      
      return {
        success: true,
        data: response.data,
        message: 'Audit trail fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch audit trail',
        data: []
      };
    }
  }

  async getIssueAnalytics(filters?: any): Promise<ApiResponse<IssueAnalytics>> {
    try {
      const response = await ApiClient.get('/api/issues/analytics', {
        params: filters
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Analytics fetched successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch analytics',
        data: null
      };
    }
  }

  async uploadAttachments(files: File[], employeeUuid: string): Promise<ApiResponse<string[]>> {
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file);
      });
      formData.append('employeeUuid', employeeUuid);

      const response = await ApiClient.post('/api/issues/upload-attachments', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data.urls || [],
        message: 'Files uploaded successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to upload files',
        data: []
      };
    }
  }
}

export const issueController = IssueController.getInstance();