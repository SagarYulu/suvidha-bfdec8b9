
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'agent' | 'user';
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface SystemMetrics {
  totalUsers: number;
  activeIssues: number;
  resolvedIssues: number;
  avgResponseTime: number;
  systemUptime: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
}

export interface BulkUploadResult {
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    rowNumber: number;
    errors: string[];
    data: Record<string, string>;
  }>;
}
