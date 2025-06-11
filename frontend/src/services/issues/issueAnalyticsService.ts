
import { apiCall } from '@/config/api';

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  pendingIssues: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  typeCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
}

export interface SLAMetrics {
  totalIssues: number;
  withinSLA: number;
  breachedSLA: number;
  slaPercentage: number;
  avgResolutionTime: number;
  criticalBreaches: number;
}

export interface TrendData {
  period: string;
  issues: number;
  resolved: number;
  resolutionRate: number;
  avgTime: number;
}

export const getAnalytics = async (filters?: any): Promise<AnalyticsData> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const getSLAMetrics = async (filters?: any): Promise<SLAMetrics> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/analytics/sla${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};

export const getTrendAnalytics = async (
  period: 'daily' | 'weekly' | 'monthly' = 'weekly',
  filters?: any
): Promise<TrendData[]> => {
  const queryParams = new URLSearchParams();
  queryParams.append('period', period);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/analytics/trends?${queryParams.toString()}`;
  return await apiCall(url);
};

export const getAdvancedAnalytics = async (filters?: any) => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }
  
  const url = `/analytics/advanced${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return await apiCall(url);
};
