
import { apiCall } from '@/config/api';

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  city?: string;
  cluster?: string;
  issue_type?: string;
}

export interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  typeCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  trends: {
    daily: Array<{ date: string; count: number; resolved: number }>;
    weekly: Array<{ week: string; count: number; resolved: number }>;
    monthly: Array<{ month: string; count: number; resolved: number }>;
  };
}

export const analyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async (filters?: AnalyticsFilters): Promise<Analytics> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/analytics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  // Get issue analytics
  getIssueAnalytics: async (filters?: AnalyticsFilters): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/analytics/issues${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  // Get SLA analytics
  getSLAAnalytics: async (filters?: AnalyticsFilters): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/analytics/sla${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  // Get trend analytics
  getTrendAnalytics: async (filters?: AnalyticsFilters): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/analytics/trends${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  // Get feedback analytics
  getFeedbackAnalytics: async (filters?: AnalyticsFilters): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/feedback/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiCall(endpoint);
    return response.data;
  },

  // Export data
  exportData: async (type: string, filters?: any): Promise<Blob> => {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`http://localhost:3000/api/export?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    return response.blob();
  },
};

// Backward compatibility alias
export const getAnalytics = analyticsService.getDashboardAnalytics;
