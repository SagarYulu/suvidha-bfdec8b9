
import { apiClient, API_ENDPOINTS } from '@/config/api';
import { IssueFilters } from './issueService';

export interface Analytics {
  totalIssues: number;
  resolvedIssues: number;
  openIssues: number;
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  typeCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  clusterCounts: Record<string, number>;
  managerCounts: Record<string, number>;
}

export const analyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async (filters?: IssueFilters): Promise<Analytics> => {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    }
    
    const url = `${API_ENDPOINTS.ANALYTICS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.get(url);
    
    return response.analytics;
  }
};
