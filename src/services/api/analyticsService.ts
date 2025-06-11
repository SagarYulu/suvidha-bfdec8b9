
import apiRequest from '@/config/api';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  status?: string;
  priority?: string;
  period?: string;
}

export interface DashboardAnalytics {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
  statusBreakdown: Array<{ status: string; count: number }>;
  priorityBreakdown: Array<{ priority: string; count: number }>;
  cityBreakdown: Array<{ city: string; count: number }>;
  typeBreakdown: Array<{ type: string; count: number }>;
}

export interface SLAMetrics {
  priority: string;
  total_issues: number;
  within_sla: number;
  breached_sla: number;
  avg_resolution_time: number;
}

export interface TrendData {
  date: string;
  total_issues: number;
  resolved_issues: number;
  critical_issues: number;
  high_priority_issues: number;
  avg_resolution_time: number;
}

export const analyticsService = {
  // Get dashboard analytics
  async getDashboardAnalytics(filters: AnalyticsFilters = {}): Promise<DashboardAnalytics> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<DashboardAnalytics>(`/analytics/dashboard?${params.toString()}`);
  },

  // Get advanced analytics
  async getAdvancedAnalytics(filters: AnalyticsFilters = {}): Promise<any> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<any>(`/analytics/advanced?${params.toString()}`);
  },

  // Get SLA metrics
  async getSLAMetrics(filters: AnalyticsFilters = {}): Promise<Record<string, SLAMetrics[]>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<Record<string, SLAMetrics[]>>(`/analytics/sla?${params.toString()}`);
  },

  // Get trend analysis
  async getTrendAnalysis(period = '30d', filters: AnalyticsFilters = {}): Promise<TrendData[]> {
    const params = new URLSearchParams();
    params.append('period', period);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<TrendData[]>(`/analytics/trends?${params.toString()}`);
  },

  // Get performance metrics
  async getPerformanceMetrics(filters: AnalyticsFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return apiRequest<any[]>(`/analytics/performance?${params.toString()}`);
  }
};
