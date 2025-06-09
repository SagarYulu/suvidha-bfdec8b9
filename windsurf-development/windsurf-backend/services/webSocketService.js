
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const config = require('../config/env');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map();
  }

  init(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    // Make WebSocket server globally available
    global.wss = this.wss;

    this.wss.on('connection', (ws, request) => {
      console.log('New WebSocket connection');
      
      ws.on('message', (message) => {
        this.handleMessage(ws, message);
      });

      ws.on('close', () => {
        this.handleDisconnection(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to real-time updates'
      }));
    });

    console.log('WebSocket server initialized on /ws');
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'authenticate':
          this.authenticateClient(ws, data.token);
          break;
        case 'subscribe':
          this.subscribeToChannel(ws, data.channel);
          break;
        case 'unsubscribe':
          this.unsubscribeFromChannel(ws, data.channel);
          break;
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong' }));
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  authenticateClient(ws, token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      
      ws.userId = decoded.id;
      ws.userRole = decoded.role;
      ws.authenticated = true;
      
      this.clients.set(ws.userId, ws);
      
      ws.send(JSON.stringify({
        type: 'authenticated',
        userId: ws.userId,
        role: ws.userRole
      }));
      
      console.log(`User ${ws.userId} authenticated via WebSocket`);
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'auth_error',
        message: 'Invalid token'
      }));
      console.error('WebSocket authentication failed:', error);
    }
  }

  subscribeToChannel(ws, channel) {
    if (!ws.authenticated) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication required'
      }));
      return;
    }

    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }

    ws.subscriptions.add(channel);
    
    ws.send(JSON.stringify({
      type: 'subscribed',
      channel: channel
    }));

    console.log(`User ${ws.userId} subscribed to channel: ${channel}`);
  }

  unsubscribeFromChannel(ws, channel) {
    if (ws.subscriptions) {
      ws.subscriptions.delete(channel);
      
      ws.send(JSON.stringify({
        type: 'unsubscribed',
        channel: channel
      }));
    }
  }

  handleDisconnection(ws) {
    if (ws.userId) {
      this.clients.delete(ws.userId);
      console.log(`User ${ws.userId} disconnected from WebSocket`);
    }
  }

  // Broadcast to specific user
  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Broadcast to users with specific role
  sendToRole(role, message) {
    let sentCount = 0;
    this.clients.forEach((client, userId) => {
      if (client.userRole === role && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        sentCount++;
      }
    });
    return sentCount;
  }

  // Broadcast to all connected clients
  broadcast(message) {
    let sentCount = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
        sentCount++;
      }
    });
    return sentCount;
  }

  // Broadcast to channel subscribers
  sendToChannel(channel, message) {
    let sentCount = 0;
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && 
          client.subscriptions && 
          client.subscriptions.has(channel)) {
        client.send(JSON.stringify(message));
        sentCount++;
      }
    });
    return sentCount;
  }

  // Real-time notifications for different events
  notifyIssueUpdate(issueId, updateType, data) {
    const message = {
      type: 'issue_update',
      issueId: issueId,
      updateType: updateType,
      data: data,
      timestamp: new Date().toISOString()
    };

    // Send to channel subscribers
    this.sendToChannel(`issue_${issueId}`, message);
    
    // Send to all admins and managers
    this.sendToRole('admin', message);
    this.sendToRole('manager', message);
  }

  notifyNewComment(issueId, comment) {
    const message = {
      type: 'new_comment',
      issueId: issueId,
      comment: comment,
      timestamp: new Date().toISOString()
    };

    this.sendToChannel(`issue_${issueId}`, message);
  }

  notifyStatusChange(issueId, oldStatus, newStatus, updatedBy) {
    const message = {
      type: 'status_change',
      issueId: issueId,
      oldStatus: oldStatus,
      newStatus: newStatus,
      updatedBy: updatedBy,
      timestamp: new Date().toISOString()
    };

    this.notifyIssueUpdate(issueId, 'status_change', message);
  }

  notifyAssignment(issueId, assignedTo, assignedBy) {
    const message = {
      type: 'assignment',
      issueId: issueId,
      assignedTo: assignedTo,
      assignedBy: assignedBy,
      timestamp: new Date().toISOString()
    };

    // Notify the assigned user
    this.sendToUser(assignedTo, message);
    
    // Notify issue stakeholders
    this.notifyIssueUpdate(issueId, 'assignment', message);
  }

  notifyEscalation(issueId, escalation) {
    const message = {
      type: 'escalation',
      issueId: issueId,
      escalation: escalation,
      timestamp: new Date().toISOString()
    };

    // Notify escalated user
    this.sendToUser(escalation.escalated_to, message);
    
    // Notify all managers and admins
    this.sendToRole('manager', message);
    this.sendToRole('admin', message);
  }

  // System-wide notifications
  sendSystemNotification(type, message, targetRole = null) {
    const notification = {
      type: 'system_notification',
      notificationType: type,
      message: message,
      timestamp: new Date().toISOString()
    };

    if (targetRole) {
      this.sendToRole(targetRole, notification);
    } else {
      this.broadcast(notification);
    }
  }

  // Get connection statistics
  getStats() {
    const clients = Array.from(this.wss.clients);
    const authenticatedClients = clients.filter(client => client.authenticated);
    
    const roleStats = {};
    authenticatedClients.forEach(client => {
      roleStats[client.userRole] = (roleStats[client.userRole] || 0) + 1;
    });

    return {
      totalConnections: clients.length,
      authenticatedConnections: authenticatedClients.length,
      roleDistribution: roleStats,
      activeChannels: this.getActiveChannels()
    };
  }

  getActiveChannels() {
    const channels = new Set();
    this.wss.clients.forEach(client => {
      if (client.subscriptions) {
        client.subscriptions.forEach(channel => channels.add(channel));
      }
    });
    return Array.from(channels);
  }
}

module.exports = new WebSocketService();
