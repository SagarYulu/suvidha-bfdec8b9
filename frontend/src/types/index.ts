
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role: 'admin' | 'manager' | 'agent' | 'employee';
  permissions?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title?: string;
  description: string;
  issueType?: string;
  issueSubtype?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  employeeId?: string;
  employeeUuid?: string;
  typeId?: string;
  subTypeId?: string;
  assignedTo?: string;
  city?: string;
  cluster?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  firstResponseAt?: string;
  resolutionNotes?: string;
  additionalDetails?: any;
  attachmentUrl?: string;
  attachments?: any;
  comments?: IssueComment[];
}

export interface IssueComment {
  id: string;
  issueId?: string;
  employeeUuid: string;
  content: string;
  isInternal?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  typeCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  trends: {
    daily: Array<{ date: string; count: number; resolved: number }>;
    weekly: Array<{ week: string; count: number; resolved: number }>;
    monthly: Array<{ month: string; count: number; resolved: number }>;
  };
}
