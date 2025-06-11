
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
  
  // Joined fields
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
  created_by: string;
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
  author_name?: string;
  author_role?: string;
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

export interface Employee {
  id: string;
  emp_name: string;
  emp_email: string;
  emp_mobile?: string;
  emp_code: string;
  cluster_id?: string;
  role?: string;
  manager?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  cluster_id?: string;
  is_active: boolean;
  phone?: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
}
