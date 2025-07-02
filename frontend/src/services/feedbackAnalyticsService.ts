
import { ApiClient } from './apiClient';
import { Feedback } from '@/types';

export interface FeedbackAnalytics {
  totalCount: number;
  sentimentDistribution: {
    happy: number;
    neutral: number;
    sad: number;
  };
  trendData: Array<{
    date: string;
    happy: number;
    neutral: number;
    sad: number;
  }>;
  optionBreakdown: Array<{
    option: string;
    count: number;
    percentage: number;
  }>;
  hierarchyData: Array<{
    category: string;
    positive: number;
    neutral: number;
    negative: number;
    total: number;
  }>;
  insightData: Array<{
    label: string;
    value: string;
    change: number;
  }>;
  feedbackSubmissionRate: number;
  totalClosedTickets: number;
}

export interface FeedbackFilters {
  city?: string;
  cluster?: string;
  sentiment?: string;
  dateRange?: string;
  agentId?: string;
  comparisonMode?: string;
}

class FeedbackAnalyticsServiceClass {
  async getAnalytics(filters: FeedbackFilters = {}): Promise<FeedbackAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await ApiClient.get(`/api/feedback/analytics?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      throw new Error('Failed to fetch feedback analytics');
    }
  }

  async getFeedbackList(filters: FeedbackFilters = {}): Promise<Feedback[]> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await ApiClient.get(`/api/feedback?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback list:', error);
      throw new Error('Failed to fetch feedback list');
    }
  }

  async getComparisonAnalytics(filters: FeedbackFilters = {}): Promise<FeedbackAnalytics> {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await ApiClient.get(`/api/feedback/analytics/comparison?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comparison analytics:', error);
      throw new Error('Failed to fetch comparison analytics');
    }
  }
}

export const FeedbackAnalyticsService = new FeedbackAnalyticsServiceClass();
