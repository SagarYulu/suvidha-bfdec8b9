
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Issue {
  id: string;
  ticket_id: string;
  employee_uuid: string;
  employee_name: string;
  employee_id: string;
  email: string;
  phone: string;
  department: string;
  city: string;
  cluster: string;
  issue_type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  description: string;
  assigned_to?: string;
  assigned_to_name?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  comments?: Comment[];
  internal_comments?: InternalComment[];
  attachments?: Attachment[];
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface InternalComment {
  id: string;
  issue_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  issue_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface Analytics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  averageResolutionTime: number;
  issuesByType: { type: string; count: number }[];
  issuesByPriority: { priority: string; count: number }[];
  issuesByStatus: { status: string; count: number }[];
  issuesByCity: { city: string; count: number }[];
  issuesTrend: { date: string; count: number }[];
}

export interface FeedbackAnalytics {
  totalFeedback: number;
  averageRating: number;
  satisfactionRate: number;
  feedbackByRating: { rating: number; count: number }[];
  feedbackTrend: { date: string; count: number; average_rating: number }[];
  topIssues: { issue_type: string; feedback_count: number; average_rating: number }[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export interface City {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Cluster {
  id: string;
  name: string;
  city_id: string;
  city_name: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  old_values?: any;
  new_values?: any;
  performed_by: string;
  performed_by_name: string;
  created_at: string;
}

export interface DashboardMetrics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  totalUsers: number;
  activeUsers: number;
  averageResolutionTime: number;
  criticalIssues: number;
  issuesCreatedToday: number;
  issuesResolvedToday: number;
}

export interface FilterOptions {
  status?: string;
  priority?: string;
  issue_type?: string;
  city?: string;
  cluster?: string;
  assigned_to?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface APIResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: PaginationInfo;
}

export interface APIError {
  error: string;
  message: string;
  details?: any;
}

export interface BulkUserUpload {
  name: string;
  email: string;
  employee_id: string;
  phone?: string;
  department?: string;
  role?: string;
}

export interface BulkUploadResult {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  success: BulkUserUpload[];
  errors: {
    row: number;
    data: BulkUserUpload;
    errors: string[];
  }[];
}
