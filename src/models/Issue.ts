export interface Issue {
  id: string;
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignedTo?: string;
  mappedTypeId?: string;
  mappedSubTypeId?: string;
  mappedBy?: string;
  mappedAt?: string;
  attachmentUrl?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  
  // Additional fields from joins
  employeeName?: string;
  employeeEmail?: string;
  employeePhone?: string;
  employeeCity?: string;
  assignedToName?: string;
  typeName?: string;
  subTypeName?: string;
}

export type IssueStatus = 
  | 'open' 
  | 'in_progress' 
  | 'pending' 
  | 'escalated' 
  | 'resolved' 
  | 'closed';

export type IssuePriority = 
  | 'low' 
  | 'medium' 
  | 'high' 
  | 'critical'
  | 'urgent';

export interface CreateIssueData {
  employeeUuid: string;
  typeId: string;
  subTypeId: string;
  description: string;
  priority?: IssuePriority;
  attachmentUrl?: string;
  attachments?: string[];
}

export interface UpdateIssueData {
  description?: string;
  status?: IssueStatus;
  priority?: IssuePriority;
  assignedTo?: string;
  mappedTypeId?: string;
  mappedSubTypeId?: string;
}

export interface IssueFilters {
  status?: IssueStatus;
  priority?: IssuePriority;
  assignedTo?: string;
  employeeUuid?: string;
  typeId?: string;
  subTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IssueComment {
  id: string;
  issueId: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
  employeeName?: string;
  isInternal?: boolean;
}

export interface CreateCommentData {
  issueId: string;
  content: string;
  isInternal?: boolean;
}

export interface IssueAuditEntry {
  id: string;
  issueId: string;
  employeeUuid: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  details?: any;
  createdAt: string;
}

export interface IssueAnalytics {
  total: number;
  byStatus: Record<IssueStatus, number>;
  byPriority: Record<IssuePriority, number>;
  avgResolutionTime: number;
  slaCompliance: number;
  trends: {
    daily: Array<{ date: string; count: number }>;
    weekly: Array<{ week: string; count: number }>;
    monthly: Array<{ month: string; count: number }>;
  };
}