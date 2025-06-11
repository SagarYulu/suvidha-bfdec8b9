
import { apiCall } from '@/config/api';
import { Analytics } from '@/types';

export interface AnalyticsFilters {
  date_from?: string;
  date_to?: string;
  city?: string;
  cluster?: string;
  issue_type?: string;
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

  // Get advanced analytics
  getAdvancedAnalytics: async (filters?: AnalyticsFilters): Promise<any> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/advanced-analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
