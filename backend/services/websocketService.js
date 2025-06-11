
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class WebSocketService {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      verifyClient: this.verifyClient.bind(this)
    });
    
    this.clients = new Map(); // userId -> WebSocket connection
    this.setupEventHandlers();
  }

  async verifyClient(info) {
    try {
      const url = new URL(info.req.url, 'http://localhost');
      const token = url.searchParams.get('token');
      
      if (!token) {
        return false;
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        return false;
      }
      
      info.req.user = user;
      return true;
    } catch (error) {
      console.error('WebSocket verification error:', error);
      return false;
    }
  }

  setupEventHandlers() {
    this.wss.on('connection', (ws, req) => {
      const user = req.user;
      
      console.log(`User ${user.email} connected via WebSocket`);
      
      // Store connection
      this.clients.set(user.id, ws);
      
      // Send welcome message
      this.sendToUser(user.id, {
        type: 'connected',
        message: 'WebSocket connection established'
      });
      
      // Handle disconnection
      ws.on('close', () => {
        console.log(`User ${user.email} disconnected from WebSocket`);
        this.clients.delete(user.id);
      });
      
      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(user.id, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });
      
      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(user.id);
      });
    });
  }

  handleMessage(userId, data) {
    switch (data.type) {
      case 'ping':
        this.sendToUser(userId, { type: 'pong' });
        break;
      case 'subscribe_issue':
        // Handle issue subscription
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  sendToUser(userId, data) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  }

  broadcast(data, excludeUserId = null) {
    this.clients.forEach((client, userId) => {
      if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Notification methods
  notifyIssueUpdate(issueId, updateData, excludeUserId = null) {
    const message = {
      type: 'issue_updated',
      issueId,
      data: updateData,
      timestamp: new Date().toISOString()
    };
    
    this.broadcast(message, excludeUserId);
  }

  notifyNewIssue(issueData) {
    const message = {
      type: 'new_issue',
      data: issueData,
      timestamp: new Date().toISOString()
    };
    
    this.broadcast(message);
  }

  notifyCommentAdded(issueId, commentData, excludeUserId = null) {
    const message = {
      type: 'comment_added',
      issueId,
      data: commentData,
      timestamp: new Date().toISOString()
    };
    
    this.broadcast(message, excludeUserId);
  }

  notifyStatusChange(issueId, oldStatus, newStatus, excludeUserId = null) {
    const message = {
      type: 'status_changed',
      issueId,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    };
    
    this.broadcast(message, excludeUserId);
  }

  getConnectedUsers() {
    return Array.from(this.clients.keys());
  }

  isUserConnected(userId) {
    return this.clients.has(userId);
  }
}

module.exports = WebSocketService;
