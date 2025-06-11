
export interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'manager' | 'agent' | 'employee';
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
  cluster_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  emp_name: string;
  emp_email: string;
  emp_mobile?: string;
  emp_code: string;
  cluster_id?: string;
  role: 'employee' | 'manager' | 'admin';
  date_of_joining?: string;
  date_of_birth?: string;
  blood_group?: string;
  account_number?: string;
  ifsc_code?: string;
  manager?: string;
  city?: string;
  cluster?: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  title?: string;
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
  // Joined fields
  emp_name?: string;
  emp_email?: string;
  emp_code?: string;
  cluster_name?: string;
  city_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
}

export interface DashboardAnalytics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  avgResolutionTime: number;
  issuesByType: Array<{ type: string; count: number }>;
  issuesByStatus: Array<{ status: string; count: number }>;
  issuesByPriority: Array<{ priority: string; count: number }>;
  userCount: number;
  recentIssues: Issue[];
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

export interface FileUpload {
  id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  url: string;
  uploaded_by: string;
  created_at: string;
}
