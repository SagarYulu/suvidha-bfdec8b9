
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  department?: string;
  status?: string;
}

export class AnalyticsService {
  static async getAnalytics(filters?: AnalyticsFilters): Promise<any> {
    return apiClient.get<any>(API_CONFIG.ENDPOINTS.ANALYTICS.BASE, filters);
  }

  static async exportData(type: string, format: string, filters?: AnalyticsFilters): Promise<void> {
    const queryString = new URLSearchParams({ format, ...filters }).toString();
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS.EXPORT}/${type}?${queryString}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export failed: ${response.status}`);
    }

    const blob = await response.blob();
    const filename = response.headers.get('content-disposition')?.split('filename=')[1] || `${type}-export.${format}`;
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace(/"/g, '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default AnalyticsService;
