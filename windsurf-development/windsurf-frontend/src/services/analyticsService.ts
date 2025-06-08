
import { apiService } from './apiService';

export interface TATMetrics {
  buckets: {
    '≤14 days': number;
    '14-30 days': number;
    '>30 days': number;
  };
  averageTAT: number;
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
}

export interface DashboardMetrics {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  resolutionRate: number;
  averageFirstResponseTime: number;
}

export interface IssueAnalytics {
  statusDistribution: Record<string, number>;
  priorityDistribution: Record<string, number>;
  cityDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

class AnalyticsService {
  async getDashboardMetrics(filters?: any): Promise<DashboardMetrics> {
    try {
      const response = await apiService.get('/dashboard/metrics', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  async getTATMetrics(filters?: any): Promise<TATMetrics> {
    try {
      const response = await apiService.get('/analytics/tat', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching TAT metrics:', error);
      throw error;
    }
  }

  async getIssueAnalytics(filters?: any): Promise<IssueAnalytics> {
    try {
      const response = await apiService.get('/analytics/issues', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching issue analytics:', error);
      throw error;
    }
  }

  async getRecentIssues(limit: number = 10): Promise<any[]> {
    try {
      const response = await apiService.get('/issues', { 
        params: { 
          limit, 
          sort: 'created_at', 
          order: 'desc' 
        } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent issues:', error);
      throw error;
    }
  }

  async getFeedbackAnalytics(filters?: any): Promise<any> {
    try {
      const response = await apiService.get('/feedback/analytics/admin', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      throw error;
    }
  }

  async getFirstResponseTimeMetrics(filters?: any): Promise<any> {
    try {
      const response = await apiService.get('/analytics/first-response', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching first response time metrics:', error);
      throw error;
    }
  }

  async getResolutionRateMetrics(filters?: any): Promise<any> {
    try {
      const response = await apiService.get('/analytics/resolution-rate', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching resolution rate metrics:', error);
      throw error;
    }
  }

  async exportAnalyticsData(format: 'csv' | 'excel' = 'csv', filters?: any): Promise<Blob> {
    try {
      const response = await apiService.get('/analytics/export', {
        params: { format, ...filters },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
