import { useEffect, useRef, useState, useCallback } from 'react';

interface RealtimeMessage {
  event: string;
  data: any;
  timestamp: string;
}

interface UseRealtimeOptions {
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  
  const {
    autoReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10
  } = options;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token available for WebSocket connection');
      return;
    }

    setConnectionStatus('connecting');
    
    try {
      const wsUrl = `ws://localhost:5000/realtime?token=${token}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        clearReconnectTimeout();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          setLastMessage(message);
          notifyListeners(message.event, message.data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to establish WebSocket connection:', error);
      setConnectionStatus('error');
      if (autoReconnect) {
        scheduleReconnect();
      }
    }
  }, [autoReconnect, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    clearReconnectTimeout();
  }, []);

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    clearReconnectTimeout();
    reconnectAttemptsRef.current++;
    
    console.log(`Scheduling reconnect attempt ${reconnectAttemptsRef.current} in ${reconnectInterval}ms`);
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, reconnectInterval);
  };

  const notifyListeners = (event: string, data: any) => {
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }

    // Also notify global listeners
    const globalListeners = listenersRef.current.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback({ event, data });
        } catch (error) {
          console.error('Error in global WebSocket listener:', error);
        }
      });
    }
  };

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    // Subscribe to the channel via WebSocket
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        channel: event
      }));
    }

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          listenersRef.current.delete(event);
          
          // Unsubscribe from the channel
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'unsubscribe',
              channel: event
            }));
          }
        }
      }
    };
  }, []);

  // Convenience subscription methods matching Supabase behavior
  const subscribeToIssueUpdates = useCallback((callback: (data: any) => void) => {
    return subscribe('issue_updated', callback);
  }, [subscribe]);

  const subscribeToComments = useCallback((callback: (data: any) => void) => {
    return subscribe('comment_added', callback);
  }, [subscribe]);

  const subscribeToAssignments = useCallback((callback: (data: any) => void) => {
    return subscribe('issue_assigned', callback);
  }, [subscribe]);

  const subscribeToStatusChanges = useCallback((callback: (data: any) => void) => {
    return subscribe('status_changed', callback);
  }, [subscribe]);

  // Send ping to keep connection alive
  const ping = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Heartbeat to keep connection alive
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        ping();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, ping]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    connect,
    disconnect,
    subscribe,
    subscribeToIssueUpdates,
    subscribeToComments,
    subscribeToAssignments,
    subscribeToStatusChanges
  };
};
