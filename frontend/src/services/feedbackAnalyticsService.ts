
import { ApiClient } from './apiClient';

export const feedbackAnalyticsService = {
  async getFeedbackOverview(filters: Record<string, any>) {
    const response = await ApiClient.get('/api/feedback/analytics/overview', {
      params: filters
    });
    return response.data;
  },

  async getFeedbackTrends(filters: Record<string, any>) {
    const response = await ApiClient.get('/api/feedback/analytics/trends', {
      params: filters
    });
    return response.data;
  },

  async getFeedbackBreakdown(filters: Record<string, any>) {
    const response = await ApiClient.get('/api/feedback/analytics/breakdown', {
      params: filters
    });
    return response.data;
  },

  async getFeedbackMetrics(filters: Record<string, any>) {
    const response = await ApiClient.get('/api/feedback/analytics/metrics', {
      params: filters
    });
    return response.data;
  },

  async exportFeedbackAnalytics(filters: Record<string, any>, format: 'csv' | 'pdf') {
    const response = await ApiClient.downloadFile(
      `/api/feedback/analytics/export?format=${format}`,
      `feedback-analytics.${format}`,
      { params: filters }
    );
    return response;
  }
};
