
import { ApiClient } from './apiClient';

interface Notification {
  id: string;
  issue_id: string;
  content: string;
  notification_type: string;
  is_read: boolean;
  created_at: string;
  issue_title?: string;
}

export class NotificationService {
  static async getNotifications(page = 1, limit = 20): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    const response = await ApiClient.get('/api/notifications', {
      params: { page, limit }
    });
    return response.data;
  }

  static async getUnreadCount(): Promise<number> {
    const response = await ApiClient.get('/api/notifications/unread-count');
    return response.data.count;
  }

  static async markAsRead(notificationId: string): Promise<void> {
    await ApiClient.patch(`/api/notifications/${notificationId}/read`);
  }

  static async markAllAsRead(): Promise<void> {
    await ApiClient.patch('/api/notifications/read-all');
  }
}
