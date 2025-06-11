
import { apiRequest, endpoints } from '@/config/api';

export interface AnalyticsFilters {
  city?: string;
  cluster?: string;
  issueType?: string;
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  issuesByType: Array<{ name: string; value: number }>;
  issuesByCity: Array<{ name: string; value: number }>;
  trends: Array<{ date: string; total: number; resolved: number }>;
}

// Analytics service for backend API
export const analyticsService = {
  // Get issue analytics
  async getIssueAnalytics(filters?: AnalyticsFilters): Promise<AnalyticsData> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.issues.analytics}?${queryParams.toString()}`
      : endpoints.issues.analytics;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },

  // Get issue trends
  async getIssueTrends(filters?: AnalyticsFilters): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.issues.trends}?${queryParams.toString()}`
      : endpoints.issues.trends;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },

  // Get feedback analytics
  async getFeedbackAnalytics(filters?: AnalyticsFilters): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.feedback.analytics}?${queryParams.toString()}`
      : endpoints.feedback.analytics;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },

  // Get sentiment analysis
  async getSentimentAnalysis(filters?: AnalyticsFilters): Promise<any> {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const endpoint = queryParams.toString() 
      ? `${endpoints.feedback.sentiment}?${queryParams.toString()}`
      : endpoints.feedback.sentiment;
    
    const response = await apiRequest(endpoint);
    return response.data || response;
  },
};

// Legacy compatibility function
export const getAnalytics = async (filters?: any): Promise<any> => {
  try {
    return await analyticsService.getIssueAnalytics(filters);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
};
