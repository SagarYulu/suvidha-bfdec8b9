import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseRealtimeOptions {
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface RealtimeMessage {
  type: string;
  data?: any;
  [key: string]: any;
}

interface UseRealtimeReturn {
  isConnected: boolean;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
  sendMessage: (message: any) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  connect: () => void;
  disconnect: () => void;
}

export const useRealtime = (
  onMessage?: (message: RealtimeMessage) => void,
  options: UseRealtimeOptions = {}
): UseRealtimeReturn => {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectInterval = 3000
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscriptionsRef = useRef<Set<string>>(new Set());

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/ws`;
  }, []);

  const authenticate = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'authenticate',
        token
      }));
    }
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    setConnectionState('connecting');
    
    try {
      const wsUrl = getWebSocketUrl();
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        
        // Authenticate immediately after connection
        authenticate();
        
        // Re-subscribe to all channels
        subscriptionsRef.current.forEach(channel => {
          wsRef.current?.send(JSON.stringify({
            type: 'subscribe',
            channel
          }));
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          // Handle system messages
          switch (message.type) {
            case 'authenticated':
              console.log('WebSocket authenticated');
              break;
            case 'auth_error':
              console.error('WebSocket authentication failed:', message.message);
              toast({
                title: 'Connection Error',
                description: 'Failed to authenticate WebSocket connection',
                variant: 'destructive'
              });
              break;
            case 'pong':
              // Handle ping/pong for keep-alive
              break;
            default:
              // Pass message to handler
              if (onMessage) {
                onMessage(message);
              }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        
        // Attempt to reconnect if not manually closed
        if (event.code !== 1000 && reconnectAttemptsRef.current < reconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`Attempting to reconnect (${reconnectAttemptsRef.current}/${reconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionState('error');
        
        toast({
          title: 'Connection Error',
          description: 'Lost connection to real-time updates',
          variant: 'destructive'
        });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState('error');
    }
  }, [getWebSocketUrl, authenticate, onMessage, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionState('disconnected');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected, cannot send message:', message);
    }
  }, []);

  const subscribe = useCallback((channel: string) => {
    subscriptionsRef.current.add(channel);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        channel
      }));
    }
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    subscriptionsRef.current.delete(channel);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        channel
      }));
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Ping/keep-alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    connectionState,
    sendMessage,
    subscribe,
    unsubscribe,
    connect,
    disconnect
  };
};

// Specialized hooks for common use cases

export const useIssueRealtime = (issueId?: string) => {
  const [updates, setUpdates] = useState<RealtimeMessage[]>([]);

  const handleMessage = useCallback((message: RealtimeMessage) => {
    if (message.type === 'issue_update' && message.issueId === issueId) {
      setUpdates(prev => [message, ...prev.slice(0, 49)]); // Keep last 50 updates
    }
  }, [issueId]);

  const realtime = useRealtime(handleMessage);

  useEffect(() => {
    if (issueId && realtime.isConnected) {
      realtime.subscribe(`issue_${issueId}`);
      
      return () => {
        realtime.unsubscribe(`issue_${issueId}`);
      };
    }
  }, [issueId, realtime]);

  return {
    ...realtime,
    updates,
    clearUpdates: () => setUpdates([])
  };
};

export const useNotificationRealtime = () => {
  const [notifications, setNotifications] = useState<RealtimeMessage[]>([]);

  const handleMessage = useCallback((message: RealtimeMessage) => {
    if (message.type === 'notification') {
      setNotifications(prev => [message, ...prev.slice(0, 99)]); // Keep last 100 notifications
      
      // Show toast for new notifications
      toast({
        title: message.data?.title || 'New Notification',
        description: message.data?.message || 'You have a new notification'
      });
    }
  }, []);

  const realtime = useRealtime(handleMessage);

  return {
    ...realtime,
    notifications,
    clearNotifications: () => setNotifications([]),
    markAsRead: (notificationId: string) => {
      setNotifications(prev => 
        prev.map(n => 
          n.data?.id === notificationId 
            ? { ...n, data: { ...n.data, is_read: true } }
            : n
        )
      );
    }
  };
};
