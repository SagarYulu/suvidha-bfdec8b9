
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export interface IssueFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export class IssueService {
  static async getIssues(filters?: IssueFilters): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ISSUES.BASE, filters);
  }

  static async getIssue(id: string): Promise<any> {
    return apiClient.get<any>(`${API_CONFIG.ENDPOINTS.ISSUES.BASE}/${id}`);
  }

  static async createIssue(issueData: any): Promise<any> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ISSUES.BASE, issueData);
  }

  static async updateIssue(id: string, updates: any): Promise<any> {
    return apiClient.put<any>(`${API_CONFIG.ENDPOINTS.ISSUES.BASE}/${id}`, updates);
  }

  static async deleteIssue(id: string): Promise<any> {
    return apiClient.delete<any>(`${API_CONFIG.ENDPOINTS.ISSUES.BASE}/${id}`);
  }

  static async assignIssue(id: string, assignedTo: string): Promise<any> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ISSUES.ASSIGN(id), { assignedTo });
  }

  static async addComment(issueId: string, content: string): Promise<any> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ISSUES.COMMENTS(issueId), { content });
  }

  static async addInternalComment(issueId: string, content: string): Promise<any> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.ISSUES.INTERNAL_COMMENTS(issueId), { content });
  }
}

export default IssueService;
