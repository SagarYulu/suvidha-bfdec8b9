
import { ApiClient } from './apiClient';

export const exportService = {
  async exportAnalyticsToCSV(filters: Record<string, any>): Promise<void> {
    await ApiClient.downloadFile(
      '/api/analytics/export/csv',
      'analytics-export.csv',
      { params: filters }
    );
  },

  async exportAnalyticsToPDF(filters: Record<string, any>): Promise<void> {
    await ApiClient.downloadFile(
      '/api/analytics/export/pdf',
      'analytics-report.pdf',
      { params: filters }
    );
  },

  async exportIssuesData(filters: Record<string, any>, format: 'csv' | 'excel'): Promise<void> {
    await ApiClient.downloadFile(
      `/api/issues/export/${format}`,
      `issues-export.${format}`,
      { params: filters }
    );
  },

  async exportFeedbackData(filters: Record<string, any>): Promise<void> {
    await ApiClient.downloadFile(
      '/api/feedback/export/csv',
      'feedback-export.csv',
      { params: filters }
    );
  },

  async exportUserData(): Promise<void> {
    await ApiClient.downloadFile(
      '/api/users/export/csv',
      'users-export.csv'
    );
  },

  async exportSentimentData(filters: Record<string, any>): Promise<void> {
    await ApiClient.downloadFile(
      '/api/sentiment/export/csv',
      'sentiment-export.csv',
      { params: filters }
    );
  }
};
