
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
  cluster_id?: string;
  is_active: boolean;
}

export interface Employee {
  id: string;
  emp_name: string;
  emp_email: string;
  emp_mobile?: string;
  emp_code: string;
  cluster_id?: string;
  role: string;
  date_of_joining?: string;
  date_of_birth?: string;
  blood_group?: string;
  account_number?: string;
  ifsc_code?: string;
  manager?: string;
  cluster_name?: string;
  city_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  issue_type: string;
  issue_subtype: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'pending' | 'escalated';
  employee_id: string;
  created_by: string;
  assigned_to?: string;
  resolved_at?: string;
  additional_details?: any;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  emp_name?: string;
  emp_email?: string;
  emp_code?: string;
  cluster_name?: string;
  city_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
}

export interface CreateIssueData {
  title?: string;
  description: string;
  issue_type: string;
  issue_subtype: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  employee_id: string;
  additional_details?: any;
}

export interface UpdateIssueData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  assigned_to?: string;
  resolution_notes?: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface TicketFeedback {
  id: string;
  issue_id: string;
  employee_uuid: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedback_option: string;
  agent_id?: string;
  agent_name?: string;
  city?: string;
  cluster?: string;
  created_at: string;
}

export interface DashboardAnalytics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  avgResolutionTime: number;
  issuesByType: Array<{ type: string; count: number }>;
  issuesByPriority: Array<{ priority: string; count: number }>;
  issuesByStatus: Array<{ status: string; count: number }>;
  recentIssues: Issue[];
  userCount: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
}
