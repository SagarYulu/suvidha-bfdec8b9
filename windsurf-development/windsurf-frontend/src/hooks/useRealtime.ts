
import { useEffect, useRef, useState } from 'react';
import { ApiService } from '../services/apiService';

interface RealtimeMessage {
  event: string;
  data: any;
  timestamp: string;
}

export const useRealtime = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<RealtimeMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  const connect = () => {
    if (eventSourceRef.current?.readyState === EventSource.OPEN) {
      return; // Already connected
    }

    setConnectionStatus('connecting');
    
    try {
      eventSourceRef.current = ApiService.createRealtimeConnection();
      
      eventSourceRef.current.onopen = () => {
        console.log('Real-time connection established');
        setIsConnected(true);
        setConnectionStatus('connected');
        clearReconnectTimeout();
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const message: RealtimeMessage = {
            event: 'message',
            data: JSON.parse(event.data),
            timestamp: new Date().toISOString()
          };
          setLastMessage(message);
          notifyListeners('message', message.data);
        } catch (error) {
          console.error('Error parsing real-time message:', error);
        }
      };

      // Handle custom events
      eventSourceRef.current.addEventListener('issue_updated', (event: any) => {
        const data = JSON.parse(event.data);
        setLastMessage({ event: 'issue_updated', data, timestamp: new Date().toISOString() });
        notifyListeners('issue_updated', data);
      });

      eventSourceRef.current.addEventListener('comment_added', (event: any) => {
        const data = JSON.parse(event.data);
        setLastMessage({ event: 'comment_added', data, timestamp: new Date().toISOString() });
        notifyListeners('comment_added', data);
      });

      eventSourceRef.current.addEventListener('issue_assigned', (event: any) => {
        const data = JSON.parse(event.data);
        setLastMessage({ event: 'issue_assigned', data, timestamp: new Date().toISOString() });
        notifyListeners('issue_assigned', data);
      });

      eventSourceRef.current.addEventListener('status_changed', (event: any) => {
        const data = JSON.parse(event.data);
        setLastMessage({ event: 'status_changed', data, timestamp: new Date().toISOString() });
        notifyListeners('status_changed', data);
      });

      eventSourceRef.current.onerror = (error) => {
        console.error('Real-time connection error:', error);
        setIsConnected(false);
        setConnectionStatus('error');
        scheduleReconnect();
      };

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  };

  const disconnect = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setConnectionStatus('disconnected');
    clearReconnectTimeout();
  };

  const clearReconnectTimeout = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    clearReconnectTimeout();
    reconnectTimeoutRef.current = setTimeout(() => {
      console.log('Attempting to reconnect...');
      connect();
    }, 5000); // Reconnect after 5 seconds
  };

  const notifyListeners = (event: string, data: any) => {
    const listeners = listenersRef.current.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in real-time listener:', error);
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
          console.error('Error in global real-time listener:', error);
        }
      });
    }
  };

  const subscribe = (event: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          listenersRef.current.delete(event);
        }
      }
    };
  };

  // Convenience subscription methods
  const subscribeToIssueUpdates = (callback: (data: any) => void) => {
    return subscribe('issue_updated', callback);
  };

  const subscribeToComments = (callback: (data: any) => void) => {
    return subscribe('comment_added', callback);
  };

  const subscribeToAssignments = (callback: (data: any) => void) => {
    return subscribe('issue_assigned', callback);
  };

  const subscribeToStatusChanges = (callback: (data: any) => void) => {
    return subscribe('status_changed', callback);
  };

  const subscribeToAll = (callback: (data: any) => void) => {
    return subscribe('*', callback);
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

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
    subscribeToStatusChanges,
    subscribeToAll
  };
};
