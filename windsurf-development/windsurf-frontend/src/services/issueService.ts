
import { apiService } from './apiService';

export const issueService = {
  getIssues: (params: any = {}) => apiService.getIssues(params),
  getIssue: (id: string) => apiService.getIssue(id),
  createIssue: (issueData: any) => apiService.createIssue(issueData),
  updateIssue: (id: string, updates: any) => apiService.updateIssue(id, updates),
  deleteIssue: (id: string) => apiService.deleteIssue(id),
  assignIssue: (id: string, assignedTo: string) => apiService.assignIssue(id, assignedTo),
  addComment: (issueId: string, content: string) => apiService.addComment(issueId, content),
  addInternalComment: (issueId: string, content: string) => apiService.addInternalComment(issueId, content),
};
