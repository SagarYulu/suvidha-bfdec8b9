
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Issue {
  id: string;
  title?: string;
  description: string;
  type: string;
  subtype?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  employee_uuid: string;
  employee_name?: string;
  assigned_to?: string;
  assigned_to_name?: string;
  city?: string;
  cluster?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  first_response_at?: string;
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  user_name?: string;
  content: string;
  is_internal?: boolean;
  created_at: string;
}

export interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  typeCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
}

export interface SentimentEntry {
  id: string;
  rating: number;
  feedback_text?: string;
  sentiment_label?: string;
  sentiment_score?: number;
  tags?: string[];
  created_at: string;
  employee_uuid?: string;
  employee_name?: string;
  city?: string;
  cluster?: string;
  role?: string;
}

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  satisfactionRate: number;
  tagDistribution: Record<string, number>;
  sentimentDistribution: Record<string, number>;
  trendData: Array<{
    period: string;
    feedback: number;
    satisfaction: number;
    responseRate: number;
  }>;
}
