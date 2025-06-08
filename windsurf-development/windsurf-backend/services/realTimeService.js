
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

class RealTimeService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.subscriptions = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/realtime',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      const token = this.extractToken(req);
      
      this.clients.set(clientId, {
        ws,
        token,
        userId: null,
        subscriptions: new Set()
      });

      console.log(`WebSocket client connected: ${clientId}`);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
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

  verifyClient(info) {
    try {
      const token = this.extractToken(info.req);
      if (!token) return false;
      
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  extractToken(req) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    return url.searchParams.get('token');
  }

  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  handleMessage(clientId, data) {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(clientId, data.channel);
        break;
      case 'unsubscribe':
        this.handleUnsubscription(clientId, data.channel);
        break;
      case 'ping':
        this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
        break;
    }
  }

  handleSubscription(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.add(channel);
    
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel).add(clientId);

    this.sendToClient(clientId, {
      type: 'subscribed',
      channel,
      timestamp: new Date().toISOString()
    });
  }

  handleUnsubscription(clientId, channel) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.subscriptions.delete(channel);
    
    const channelSubs = this.subscriptions.get(channel);
    if (channelSubs) {
      channelSubs.delete(clientId);
      if (channelSubs.size === 0) {
        this.subscriptions.delete(channel);
      }
    }

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
    const channelSubs = this.subscriptions.get(channel);
    if (!channelSubs) return;

    const broadcastMessage = {
      type: 'broadcast',
      channel,
      data: message,
      timestamp: new Date().toISOString()
    };

    channelSubs.forEach(clientId => {
      this.sendToClient(clientId, broadcastMessage);
    });
  }

  // Issue-specific methods
  notifyIssueStatusChange(issueId, oldStatus, newStatus, updatedBy) {
    this.broadcast(`issue:${issueId}`, {
      type: 'status_changed',
      issueId,
      oldStatus,
      newStatus,
      updatedBy,
      timestamp: new Date().toISOString()
    });

    this.broadcast('issues', {
      type: 'issue_updated',
      issueId,
      changes: { status: newStatus },
      timestamp: new Date().toISOString()
    });
  }

  notifyNewComment(issueId, comment) {
    this.broadcast(`issue:${issueId}`, {
      type: 'comment_added',
      issueId,
      comment,
      timestamp: new Date().toISOString()
    });
  }

  notifyIssueAssignment(issueId, assigneeId, assignedBy) {
    this.broadcast(`issue:${issueId}`, {
      type: 'issue_assigned',
      issueId,
      assigneeId,
      assignedBy,
      timestamp: new Date().toISOString()
    });

    this.broadcast(`user:${assigneeId}`, {
      type: 'new_assignment',
      issueId,
      timestamp: new Date().toISOString()
    });
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
    this.subscriptions.clear();
  }
}

module.exports = new RealTimeService();
