
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiService } from "@/services/apiService";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  issueId?: string;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      // Set up real-time polling for notifications
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await apiService.getNotifications(user.id);
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n.id);
    for (const id of unreadIds) {
      await markAsRead(id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id}
                  className={`m-2 cursor-pointer transition-colors ${
                    !notification.isRead ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationSystem;
