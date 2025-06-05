
import { apiService } from './apiService';

interface RealtimeUpdate {
  type: 'issue_updated' | 'issue_assigned' | 'comment_added' | 'status_changed';
  data: any;
  timestamp: string;
}

class RealTimeService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private reconnectAttempts = 0;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token, skipping real-time connection');
        return;
      }

      const baseUrl = process.env.VITE_API_URL || 'http://localhost:5000';
      this.eventSource = new EventSource(`${baseUrl}/api/realtime/stream?token=${token}`);

      this.eventSource.onopen = () => {
        console.log('Real-time connection established');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const update: RealtimeUpdate = JSON.parse(event.data);
          this.handleUpdate(update);
        } catch (error) {
          console.error('Failed to parse real-time update:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('Real-time connection error:', error);
        this.handleReconnection();
      };

    } catch (error) {
      console.error('Failed to initialize real-time connection:', error);
      this.handleReconnection();
    }
  }

  private handleUpdate(update: RealtimeUpdate) {
    const listeners = this.listeners.get(update.type);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(update.data);
        } catch (error) {
          console.error('Error in real-time listener:', error);
        }
      });
    }

    // Handle global listeners
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(update);
        } catch (error) {
          console.error('Error in global real-time listener:', error);
        }
      });
    }
  }

  private handleReconnection() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts), this.maxReconnectDelay);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.initializeConnection();
    }, delay);
  }

  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  // Convenience methods for common subscriptions
  subscribeToIssueUpdates(callback: (issue: any) => void) {
    return this.subscribe('issue_updated', callback);
  }

  subscribeToAssignments(callback: (assignment: any) => void) {
    return this.subscribe('issue_assigned', callback);
  }

  subscribeToComments(callback: (comment: any) => void) {
    return this.subscribe('comment_added', callback);
  }

  subscribeToStatusChanges(callback: (statusChange: any) => void) {
    return this.subscribe('status_changed', callback);
  }

  // Subscribe to all events
  subscribeToAll(callback: (update: RealtimeUpdate) => void) {
    return this.subscribe('*', callback);
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.listeners.clear();
  }

  // Force reconnection
  reconnect() {
    this.disconnect();
    this.initializeConnection();
  }

  // Get connection status
  getConnectionState() {
    return this.eventSource?.readyState || EventSource.CLOSED;
  }

  isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN;
  }
}

export const realTimeService = new RealTimeService();
