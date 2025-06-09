
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export class NotificationService {
  static async getNotifications(userId: string, params?: any): Promise<any> {
    return apiClient.get<any>(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE}/${userId}`, params);
  }

  static async markNotificationAsRead(notificationId: string): Promise<any> {
    return apiClient.post<any>(API_CONFIG.ENDPOINTS.NOTIFICATIONS.READ(notificationId));
  }

  static async markAllNotificationsAsRead(userId: string): Promise<any> {
    return apiClient.post<any>(`${API_CONFIG.ENDPOINTS.NOTIFICATIONS.BASE}/read-all/${userId}`);
  }
}

export default NotificationService;
