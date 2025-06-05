
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulate WebSocket connection for real-time notifications
    const connectWebSocket = () => {
      setIsConnected(true);
      
      // Simulate receiving notifications
      const interval = setInterval(() => {
        const mockNotifications: Notification[] = [
          {
            id: Date.now().toString(),
            title: 'New Issue Assigned',
            message: 'Issue #123 has been assigned to you',
            type: 'info',
            timestamp: new Date(),
            read: false
          }
        ];
        
        mockNotifications.forEach(notification => {
          setNotifications(prev => [notification, ...prev]);
          toast(notification.title, {
            description: notification.message,
          });
        });
      }, 30000); // Every 30 seconds

      return () => {
        clearInterval(interval);
        setIsConnected(false);
      };
    };

    const cleanup = connectWebSocket();
    return cleanup;
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    clearAll
  };
};
