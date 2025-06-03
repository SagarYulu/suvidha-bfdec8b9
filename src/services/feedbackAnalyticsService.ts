
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
  agentName?: string;
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

export interface FeedbackItem {
  id: string;
  issue_id: string;
  employee_uuid: string;
  created_at: string;
  sentiment: string;
  feedback_option: string;
  cluster?: string;
  city?: string;
  agent_id?: string;
  agent_name?: string;
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

export const fetchFeedbackData = async (filters: FeedbackFilters): Promise<FeedbackItem[]> => {
  try {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.city) params.append('city', filters.city);
    if (filters.cluster) params.append('cluster', filters.cluster);
    if (filters.agentId) params.append('agentId', filters.agentId);
    
    const response = await api.get(`${API_ENDPOINTS.ANALYTICS}/feedback?${params.toString()}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching feedback data:', error);
    return [];
  }
};

export const calculateFeedbackMetrics = async (data: FeedbackItem[], filters: FeedbackFilters): Promise<FeedbackMetrics> => {
  // Mock implementation - replace with actual calculation logic
  const totalCount = data.length;
  const happyCount = data.filter(item => item.sentiment === 'happy').length;
  const neutralCount = data.filter(item => item.sentiment === 'neutral').length;
  const sadCount = data.filter(item => item.sentiment === 'sad').length;
  
  return {
    totalFeedback: totalCount,
    totalCount,
    averageRating: 4.2,
    responseRate: 85,
    sentimentScore: 7.5,
    totalClosedTickets: 1000,
    feedbackSubmissionRate: totalCount > 0 ? (totalCount / 1000) * 100 : 0,
    sentimentPercentages: {
      happy: totalCount > 0 ? (happyCount / totalCount) * 100 : 0,
      neutral: totalCount > 0 ? (neutralCount / totalCount) * 100 : 0,
      sad: totalCount > 0 ? (sadCount / totalCount) * 100 : 0,
    },
    sentimentCounts: {
      happy: happyCount,
      neutral: neutralCount,
      sad: sadCount,
    },
    insightData: [],
    hierarchyData: [],
    trendData: [],
  };
};

export const fetchComparisonData = async (filters: FeedbackFilters) => {
  try {
    const currentData = await fetchFeedbackData(filters);
    const currentMetrics = await calculateFeedbackMetrics(currentData, filters);
    
    // Mock previous period data - replace with actual logic
    const previousMetrics = await calculateFeedbackMetrics([], filters);
    
    return {
      current: currentMetrics,
      previous: previousMetrics,
    };
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    throw error;
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
