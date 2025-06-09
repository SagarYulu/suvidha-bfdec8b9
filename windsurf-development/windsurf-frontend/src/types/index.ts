
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId?: string;
  phone?: string;
  city?: string;
  cluster?: string;
}

export interface Issue {
  id: string;
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  attachmentUrl?: string;
  attachments?: string;
  comments?: IssueComment[];
  employeeName?: string;
  assigneeName?: string;
}

export interface IssueComment {
  id: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
  employeeName?: string;
}

export interface IssueFilters {
  status?: string;
  priority?: string;
  assignedTo?: string;
  employeeUuid?: string;
  page?: number;
  limit?: number;
}

export interface Analytics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  criticalIssues: number;
  averageResolutionTime: number;
  issuesByType: Array<{ type: string; count: number }>;
  issuesByPriority: Array<{ priority: string; count: number }>;
  trendsData: Array<{ date: string; issues: number }>;
}
