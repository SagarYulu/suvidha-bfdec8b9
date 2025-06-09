
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // userId -> WebSocket connection
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', (ws, req) => {
      const token = new URL(req.url, `http://${req.headers.host}`).searchParams.get('token');
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        // Store connection
        this.clients.set(userId, ws);
        console.log(`WebSocket connected: User ${userId}`);

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'connected',
          message: 'Real-time connection established'
        }));

        // Handle connection close
        ws.on('close', () => {
          this.clients.delete(userId);
          console.log(`WebSocket disconnected: User ${userId}`);
        });

        // Handle client messages
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message);
            this.handleClientMessage(userId, data);
          } catch (error) {
            console.error('Invalid WebSocket message:', error);
          }
        });

      } catch (error) {
        console.error('WebSocket auth failed:', error);
        ws.close(1008, 'Authentication failed');
      }
    });

    console.log('✅ WebSocket server initialized on /ws');
  }

  verifyClient(info) {
    const url = new URL(info.req.url, `http://${info.req.headers.host}`);
    const token = url.searchParams.get('token');
    
    if (!token) return false;
    
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      return false;
    }
  }

  handleClientMessage(userId, data) {
    switch (data.type) {
      case 'ping':
        this.sendToUser(userId, { type: 'pong', timestamp: Date.now() });
        break;
      case 'subscribe':
        // Handle subscription to specific issue updates
        this.sendToUser(userId, { 
          type: 'subscribed', 
          channel: data.channel 
        });
        break;
    }
  }

  // Send message to specific user
  sendToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  // Broadcast to all connected users
  broadcast(message) {
    const payload = JSON.stringify(message);
    this.clients.forEach((client, userId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // Send to multiple users
  sendToUsers(userIds, message) {
    const payload = JSON.stringify(message);
    userIds.forEach(userId => {
      const client = this.clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  // Issue-specific notifications
  async notifyIssueUpdate(issueId, updateType, data) {
    try {
      // Get all users who should be notified about this issue
      const [issue] = await pool.execute(
        'SELECT employee_uuid, assigned_to FROM issues WHERE id = ?',
        [issueId]
      );

      if (issue.length === 0) return;

      const { employee_uuid, assigned_to } = issue[0];
      const notifyUsers = [employee_uuid];
      
      if (assigned_to && assigned_to !== employee_uuid) {
        notifyUsers.push(assigned_to);
      }

      // Send notification to relevant users
      this.sendToUsers(notifyUsers, {
        type: 'issue_update',
        issueId,
        updateType,
        data,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error notifying issue update:', error);
    }
  }

  // Comment notifications
  async notifyNewComment(issueId, comment) {
    await this.notifyIssueUpdate(issueId, 'new_comment', {
      comment,
      message: 'New comment added to your issue'
    });
  }

  // Status change notifications
  async notifyStatusChange(issueId, oldStatus, newStatus, updatedBy) {
    await this.notifyIssueUpdate(issueId, 'status_change', {
      oldStatus,
      newStatus,
      updatedBy,
      message: `Issue status changed from ${oldStatus} to ${newStatus}`
    });
  }

  // Assignment notifications
  async notifyAssignment(issueId, assignedTo, assignedBy) {
    await this.notifyIssueUpdate(issueId, 'assignment', {
      assignedTo,
      assignedBy,
      message: 'Issue has been assigned to you'
    });
  }

  getConnectedUsers() {
    return Array.from(this.clients.keys());
  }

  getConnectionCount() {
    return this.clients.size;
  }

  closeAllConnections() {
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.close();
      }
    });
    this.clients.clear();
  }
}

module.exports = new WebSocketService();
