
import { ApiClient } from "../apiClient";
import { IssueFilters } from "./issueFilters";

export interface AnalyticsData {
  totalIssues: number;
  resolvedIssues: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  resolutionRate: number;
  typeCounts: Record<string, number>;
  cityCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
}

export const getAnalytics = async (filters?: IssueFilters): Promise<AnalyticsData> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== null) {
          queryParams.append(key, value);
        }
      });
    }
    
    const response = await ApiClient.get(`/api/analytics?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    // Return default data structure on error
    return {
      totalIssues: 0,
      resolvedIssues: 0,
      avgResolutionTime: 0,
      avgFirstResponseTime: 0,
      resolutionRate: 0,
      typeCounts: {},
      cityCounts: {},
      statusCounts: {},
      priorityCounts: {}
    };
  }
};
