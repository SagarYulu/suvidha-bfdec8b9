
// Core types that match the backend API structure
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  employeeId?: string;
  userId?: string; // Add this back for compatibility
  city?: string;
  cluster?: string;
  manager?: string;
  role: 'admin' | 'manager' | 'agent' | 'employee' | '';
  permissions?: string[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  password?: string; // Add for forms
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
  escalation_level?: number;
  escalated_at?: string;
  reopenableUntil?: string;
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
  employeeId?: string; // Add for compatibility
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

// Filter interfaces
export interface DashboardFilters {
  city?: string;
  cluster?: string;
  type?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  dateFrom?: string;
  dateTo?: string;
}

export interface IssueFilters {
  city?: string;
  cluster?: string;
  type?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export type ComparisonMode = 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';
