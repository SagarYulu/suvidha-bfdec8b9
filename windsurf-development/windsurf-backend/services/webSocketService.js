
const WebSocket = require('ws');

class WebSocketService {
  constructor() {
    this.wss = null;
    this.connections = new Map();
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });

    this.wss.on('connection', (ws, req) => {
      const userId = this.extractUserIdFromRequest(req);
      
      if (userId) {
        this.connections.set(userId, ws);
        console.log(`WebSocket connected for user: ${userId}`);
      }

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data, userId);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        if (userId) {
          this.connections.delete(userId);
          console.log(`WebSocket disconnected for user: ${userId}`);
        }
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    console.log('WebSocket server initialized');
  }

  extractUserIdFromRequest(req) {
    // Extract user ID from query params or headers
    const url = new URL(req.url, 'http://localhost');
    return url.searchParams.get('userId');
  }

  handleMessage(ws, data, userId) {
    // Handle different message types
    switch (data.type) {
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
      case 'subscribe':
        // Handle subscription to specific channels
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  broadcastToUser(userId, message) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  broadcastToAll(message) {
    this.connections.forEach((ws, userId) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  notifyIssueUpdate(issueId, employeeUuid, updateData) {
    const message = {
      type: 'issue_update',
      issueId,
      data: updateData,
      timestamp: new Date().toISOString()
    };

    // Notify the issue creator
    this.broadcastToUser(employeeUuid, message);

    // Notify assigned agent if different
    if (updateData.assigned_to && updateData.assigned_to !== employeeUuid) {
      this.broadcastToUser(updateData.assigned_to, message);
    }
  }

  notifyNewComment(issueId, employeeUuid, comment) {
    const message = {
      type: 'new_comment',
      issueId,
      comment,
      timestamp: new Date().toISOString()
    };

    this.broadcastToUser(employeeUuid, message);
  }

  getConnectionCount() {
    return this.connections.size;
  }

  closeAllConnections() {
    this.connections.forEach((ws) => {
      ws.close();
    });
    this.connections.clear();
    
    if (this.wss) {
      this.wss.close();
    }
  }
}

module.exports = new WebSocketService();
