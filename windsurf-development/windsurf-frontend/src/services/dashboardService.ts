
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  department?: string;
}

export class DashboardService {
  static async getMetrics(filters?: DashboardFilters): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.DASHBOARD.METRICS, filters);
  }

  static async getChartData(type: string, filters?: DashboardFilters): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.DASHBOARD.CHARTS, { 
      type, 
      filters: JSON.stringify(filters) 
    });
  }
}

export default DashboardService;
