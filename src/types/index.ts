
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

export interface IssueComment {
  id: string;
  content: string;
  employeeUuid: string;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  issueType: string;
  issueSubtype?: string;
  typeId?: string;
  subTypeId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  employeeId: string;
  employeeUuid?: string;
  assignedTo?: string;
  city?: string;
  cluster?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  firstResponseAt?: string;
  resolutionNotes?: string;
  additionalDetails?: any;
  comments: IssueComment[];
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

// Bulk upload types
export interface RowData {
  [key: string]: any;
  id?: string;
  userId?: string;
  emp_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  city?: string;
  cluster?: string;
  manager?: string;
  role?: string;
  password?: string;
  date_of_joining?: string;
  date_of_birth?: string;
  blood_group?: string;
  account_number?: string;
  ifsc_code?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: any;
  rowData?: RowData;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  validRows: RowData[];
  invalidRows: ValidationError[];
  errors: ValidationError[];
  validEmployees: RowData[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
  };
}

export interface EditedRowsRecord {
  [key: string]: RowData;
}

export interface CSVEmployeeData {
  name: string;
  email: string;
  phone?: string;
  employeeId: string;
  city: string;
  cluster: string;
  manager?: string;
  id?: string;
  userId?: string;
  emp_id?: string;
  role?: string;
  password?: string;
  isActive?: boolean;
  date_of_joining?: string;
  date_of_birth?: string;
  blood_group?: string;
  account_number?: string;
  ifsc_code?: string;
}

// Sentiment types
export interface SentimentAlert {
  id: string;
  type: 'low_rating' | 'negative_trend' | 'urgent_feedback';
  message: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: string;
  resolved: boolean;
  is_resolved?: boolean;
  created_at?: string;
  trigger_reason?: string;
  city?: string;
  cluster?: string;
  role?: string;
  average_score?: number;
  change_percentage?: number;
}

// Feedback types
export interface FeedbackMetrics {
  totalCount: number;
  averageRating: number;
  responseRate: number;
  satisfactionScore: number;
  sentimentPercentages: {
    happy: number;
    neutral: number;
    sad: number;
  };
  sentimentCounts: {
    happy: number;
    neutral: number;
    sad: number;
  };
}

export interface FeedbackFilters {
  startDate?: string;
  endDate?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  category?: string;
  rating?: number;
  issueType?: string;
  city?: string;
  cluster?: string;
  role?: string;
  sentiment?: string;
}

export interface TrendData {
  date: string;
  happy: number;
  neutral: number;
  sad: number;
  total?: number;
}

export type ComparisonMode = 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';
