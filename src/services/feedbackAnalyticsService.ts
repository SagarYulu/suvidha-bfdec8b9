
import { api } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';

export interface FeedbackFilters {
  dateRange?: string;
  city?: string;
  cluster?: string;
  rating?: number;
  startDate?: string;
  endDate?: string;
  agentId?: string;
  comparisonMode?: string;
}

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  sentimentScore: number;
  totalCount: number;
  totalClosedTickets: number;
  feedbackSubmissionRate: number;
  insightData: any;
  hierarchyData: any;
  trendData: any;
}

export const getFeedbackAnalytics = async () => {
  try {
    const response = await api.get(API_ENDPOINTS.ANALYTICS);
    return response.data;
  } catch (error) {
    console.error('Error fetching feedback analytics:', error);
    return null;
  }
};

export const getAuditTrail = async (issueId: string) => {
  try {
    const response = await api.get(`/audit-logs/${issueId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    return [];
  }
};
