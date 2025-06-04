
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  employee_id?: string;
  city?: string;
  cluster?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  employee_id?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  creator_name?: string;
  assignee_name?: string;
}

export interface Comment {
  id: string;
  issue_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_name?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface DashboardMetrics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  averageResolutionTime: number;
  satisfactionScore: number;
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface ExportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  priority?: string;
  role?: string;
  department?: string;
}
