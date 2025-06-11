
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  userId?: string;
  city?: string;
  cluster?: string;
  role: 'admin' | 'manager' | 'agent' | 'employee';
  permissions?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for bulk upload compatibility
  password?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  accountNumber?: string;
  ifscCode?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  issueType: string;
  issueSubtype?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  employeeId: string;
  employeeUuid?: string;
  assignedTo?: string;
  city?: string;
  cluster?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  firstResponseAt?: string;
  resolutionNotes?: string;
  additionalDetails?: any;
  typeId?: string;
  escalation_level?: number;
  escalated_at?: string;
  reopenableUntil?: string;
}

export interface IssueComment {
  id: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  content: string;
  isInternal: boolean;
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

export interface Feedback {
  id: string;
  issueId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

// Bulk upload related types
export interface CSVEmployeeData {
  id?: string;
  userId?: string;
  emp_id: string;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  cluster?: string | null;
  role: string;
  manager?: string | null;
  date_of_joining?: string | null;
  date_of_birth?: string | null;
  blood_group?: string | null;
  account_number?: string | null;
  ifsc_code?: string | null;
  password?: string;
  employeeId?: string; // Required for compatibility
}

export interface RowData {
  id: string;
  userId: string;
  emp_id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  cluster: string;
  role: string;
  manager: string;
  date_of_joining: string;
  date_of_birth: string;
  blood_group: string;
  account_number: string;
  ifsc_code: string;
  password: string;
  employeeId?: string; // Required for compatibility
}

export interface ValidationError {
  row: CSVEmployeeData;
  errors: string[];
  rowData: RowData;
}

export interface ValidationResult {
  validEmployees: CSVEmployeeData[];
  invalidRows: ValidationError[];
  isValid: boolean;
  validRows: RowData[];
  errors: ValidationError[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface EditedRowsRecord {
  [key: string]: RowData;
}

export interface DashboardFilters {
  city?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  cluster?: string;
  issueType?: string;
}

export interface SentimentAlert {
  id: string;
  type: 'low_rating' | 'negative_sentiment' | 'high_volume';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  created_at?: string;
  resolved: boolean;
  is_resolved?: boolean;
  trigger_reason?: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score?: number;
  change_percentage?: number;
}

export interface FeedbackMetrics {
  averageRating: number;
  totalResponses: number;
  responseRate: number;
  sentimentDistribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topOptions: Array<{
    option: string;
    count: number;
    percentage: number;
  }>;
  trendData: Array<{
    date: string;
    rating: number;
    responses: number;
  }>;
}
