
const WebSocket = require('ws');

class RealTimeService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map to store client connections with metadata
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/realtime'
    });

    this.wss.on('connection', (ws, req) => {
      console.log('New WebSocket connection established');
      
      // Extract user info from connection if available
      const url = new URL(req.url, `http://${req.headers.host}`);
      const token = url.searchParams.get('token');
      
      // Store client with metadata
      const clientId = this.generateClientId();
      this.clients.set(clientId, {
        ws,
        token,
        userId: null, // Will be set after authentication
        subscriptions: new Set()
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket connection closed');
        this.clients.delete(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(clientId);
      });

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        clientId,
        timestamp: new Date().toISOString()
      }));
    });

    console.log('Real-time WebSocket server initialized');
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(clientId, data);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, data);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  handleSubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = data;
    client.subscriptions.add(channel);
    
    this.sendToClient(clientId, {
      type: 'subscribed',
      channel,
      timestamp: new Date().toISOString()
    });
  }

  handleUnsubscription(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = data;
    client.subscriptions.delete(channel);
    
    this.sendToClient(clientId, {
      type: 'unsubscribed',
      channel,
      timestamp: new Date().toISOString()
    });
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcast(channel, message) {
    const broadcastMessage = {
      type: 'broadcast',
      channel,
      data: message,
      timestamp: new Date().toISOString()
    };

    this.clients.forEach((client, clientId) => {
      if (client.subscriptions.has(channel) && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(broadcastMessage));
      }
    });
  }

  // Notify about issue updates
  notifyIssueUpdate(issueId, updateType, data) {
    this.broadcast(`issue:${issueId}`, {
      type: updateType,
      issueId,
      data
    });
    
    // Also broadcast to general issues channel
    this.broadcast('issues', {
      type: updateType,
      issueId,
      data
    });
  }

  // Notify about new comments
  notifyNewComment(issueId, comment) {
    this.broadcast(`issue:${issueId}`, {
      type: 'comment_added',
      issueId,
      comment
    });
  }

  // Notify about status changes
  notifyStatusChange(issueId, oldStatus, newStatus, updatedBy) {
    this.broadcast(`issue:${issueId}`, {
      type: 'status_changed',
      issueId,
      oldStatus,
      newStatus,
      updatedBy
    });
  }

  // Notify about assignments
  notifyAssignment(issueId, assigneeId, assignedBy) {
    this.broadcast(`issue:${issueId}`, {
      type: 'issue_assigned',
      issueId,
      assigneeId,
      assignedBy
    });
    
    // Notify the assignee specifically
    this.broadcast(`user:${assigneeId}`, {
      type: 'new_assignment',
      issueId
    });
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  getConnectedClients() {
    return this.clients.size;
  }

  closeAllConnections() {
    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.close();
      }
    });
    this.clients.clear();
  }
}

module.exports = new RealTimeService();
