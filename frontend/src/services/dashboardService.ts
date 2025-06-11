
import { ApiClient } from './apiClient';
import { DashboardAnalytics, Issue } from '@/types';

export class DashboardService {
  static async getAnalytics(filters?: {
    dateFrom?: string;
    dateTo?: string;
    city?: string;
    cluster?: string;
  }): Promise<DashboardAnalytics> {
    const response = await ApiClient.get('/api/dashboard/analytics', {
      params: filters
    });
    return response.data;
  }

  static async getRecentIssues(limit: number = 10): Promise<Issue[]> {
    const response = await ApiClient.get('/api/dashboard/recent-issues', {
      params: { limit }
    });
    return response.data;
  }

  static async getUserCount(): Promise<number> {
    const response = await ApiClient.get('/api/dashboard/user-count');
    return response.data.count;
  }

  static async getIssuesTrend(period: string = '30d'): Promise<Array<{
    date: string;
    count: number;
  }>> {
    const response = await ApiClient.get('/api/dashboard/issues-trend', {
      params: { period }
    });
    return response.data;
  }

  static async getResolutionTimeTrend(period: string = '30d'): Promise<Array<{
    date: string;
    avgTime: number;
  }>> {
    const response = await ApiClient.get('/api/dashboard/resolution-time-trend', {
      params: { period }
    });
    return response.data;
  }
}
