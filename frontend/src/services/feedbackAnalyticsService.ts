
import { apiCall } from '@/config/api';

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  satisfactionScore: number;
  recentFeedback: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface FeedbackTrendData {
  period: string;
  feedback: number;
  satisfaction: number;
  responseRate: number;
}

export interface FeedbackByCategory {
  category: string;
  count: number;
  averageRating: number;
}

export interface SentimentAnalysis {
  positive: number;
  negative: number;
  neutral: number;
  totalAnalyzed: number;
}

export const getFeedbackMetrics = async (filters?: any): Promise<FeedbackMetrics> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/feedback/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const getFeedbackTrends = async (
  period: 'daily' | 'weekly' | 'monthly' = 'weekly',
  filters?: any
): Promise<FeedbackTrendData[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', period);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/feedback/trends?${queryParams.toString()}`;
  return await apiCall(url);
};

export const getFeedbackByCategory = async (filters?: any): Promise<FeedbackByCategory[]> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/feedback/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const getSentimentAnalysis = async (filters?: any): Promise<SentimentAnalysis> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/feedback/sentiment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const exportFeedbackData = async (format: 'csv' | 'excel' | 'pdf', filters?: any): Promise<Blob> => {
  const queryParams = new URLSearchParams();
  queryParams.append('format', format);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const response = await fetch(`/api/feedback/export?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Export failed');
  }
  
  return await response.blob();
};
