
import { ApiClient } from './apiClient';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
  includeComments?: boolean;
}

class ExportServiceClass {
  async exportIssues(options: ExportOptions) {
    try {
      const response = await ApiClient.post('/api/export/issues', options);
      return response.data;
    } catch (error) {
      throw new Error('Failed to export issues');
    }
  }

  async exportAnalytics(options: ExportOptions) {
    try {
      const response = await ApiClient.post('/api/export/analytics', options);
      return response.data;
    } catch (error) {
      throw new Error('Failed to export analytics');
    }
  }

  async exportFeedback(options: ExportOptions) {
    try {
      const response = await ApiClient.post('/api/export/feedback', options);
      return response.data;
    } catch (error) {
      throw new Error('Failed to export feedback');
    }
  }

  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export const ExportService = new ExportServiceClass();
