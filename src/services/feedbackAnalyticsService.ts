
import { api } from '../lib/api';
import { API_ENDPOINTS } from '../config/api';

export interface FeedbackFilters {
  dateRange?: string;
  city?: string;
  cluster?: string;
  rating?: number;
}

export interface FeedbackMetrics {
  totalFeedback: number;
  averageRating: number;
  responseRate: number;
  sentimentScore: number;
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
