
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  city?: string;
  cluster?: string;
  phone?: string;
  employee_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  type: string;
  subType: string;
  userId: string;
  userName?: string;
  userRole?: string;
  userCity?: string;
  userCluster?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface Comment {
  id: string;
  issueId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName?: string;
  userRole?: string;
  userCity?: string;
  userCluster?: string;
  rating: number;
  comment?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  tags: string[];
  createdAt: string;
  issueId?: string;
}

export interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  resolutionRate: number;
  issuesByType: Array<{ name: string; value: number }>;
  issuesByCity: Array<{ name: string; value: number }>;
  issuesByStatus: Array<{ name: string; value: number }>;
  monthlyTrends: Array<{ month: string; issues: number; resolved: number }>;
}

export interface SentimentData {
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  averageRating: number;
  totalFeedback: number;
  trendData: Array<{
    date: string;
    rating: number;
    sentiment: string;
  }>;
  topicAnalysis: Array<{
    topic: string;
    count: number;
    sentiment: string;
  }>;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string[];
  priority?: string[];
  type?: string[];
  city?: string[];
  cluster?: string[];
  role?: string[];
  assignedTo?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export type Permission = 
  | 'view:dashboard'
  | 'manage:users'
  | 'manage:issues'
  | 'manage:analytics'
  | 'manage:settings'
  | 'access:security'
  | 'create:dashboardUser'
  | 'view_analytics';

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entityType: string;
  entityId?: string;
  userId: string;
  userName: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
