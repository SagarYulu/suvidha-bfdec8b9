
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'support' | 'employee';
  employeeId?: string;
  phone?: string;
  city?: string;
  cluster?: string;
}

export interface Issue {
  id: string;
  employee_uuid: string;
  type_id: string;
  sub_type_id: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  attachment_url?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  employee_name?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  assigned_to_name?: string;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  issue_id: string;
  employee_uuid: string;
  content: string;
  created_at: string;
  commenter_name?: string;
}

export interface CreateIssueData {
  typeId: string;
  subTypeId: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  attachment?: File;
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

export interface Analytics {
  overview: {
    totalIssues: number;
    openIssues: number;
    resolvedIssues: number;
    avgResolutionTime: number;
  };
  statusBreakdown: Array<{ status: string; count: number }>;
  priorityBreakdown: Array<{ priority: string; count: number }>;
  typeBreakdown: Array<{ type_id: string; count: number }>;
  cityBreakdown: Array<{ city: string; count: number }>;
  recentIssues: Issue[];
  monthlyTrends: Array<{ month: string; count: number }>;
}
