const EventEmitter = require('events');
const WebSocket = require('ws');

class RealTimeService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // userId -> Set of connections
    this.wsServer = null;
    this.setMaxListeners(0);
  }

  // Initialize WebSocket server
  initializeWebSocketServer(server) {
    this.wsServer = new WebSocket.Server({ 
      server,
      path: '/realtime'
    });

    this.wsServer.on('connection', (ws, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    console.log('WebSocket server initialized on /realtime');
  }

  // Handle WebSocket connection
  handleWebSocketConnection(ws, req) {
    const url = new URL(req.url, 'http://localhost');
    const token = url.searchParams.get('token');
    
    if (!token) {
      ws.close(1008, 'Authentication required');
      return;
    }

    // Verify token and get user
    this.verifyTokenAndAddClient(ws, token);
  }

  async verifyTokenAndAddClient(ws, token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Add client to tracking
      if (!this.clients.has(userId)) {
        this.clients.set(userId, new Set());
      }
      this.clients.get(userId).add(ws);

      // Setup WebSocket handlers
      ws.userId = userId;
      ws.isAlive = true;
      
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        this.removeClient(userId, ws);
      });

      ws.on('message', (message) => {
        this.handleWebSocketMessage(ws, message);
      });

      // Send connection confirmation
      this.sendToClient(ws, 'connected', {
        message: 'Real-time connection established',
        userId: userId,
        timestamp: new Date().toISOString()
      });

      console.log(`WebSocket client connected: ${userId}`);

    } catch (error) {
      console.error('Token verification failed:', error);
      ws.close(1008, 'Invalid token');
    }
  }

  // Handle incoming WebSocket messages
  handleWebSocketMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'subscribe':
          this.handleSubscription(ws, data);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(ws, data);
          break;
        case 'ping':
          this.sendToClient(ws, 'pong', { timestamp: new Date().toISOString() });
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  // Handle subscription requests
  handleSubscription(ws, data) {
    const { channel, filters } = data;
    
    if (!ws.subscriptions) {
      ws.subscriptions = new Set();
    }
    
    ws.subscriptions.add(channel);
    
    this.sendToClient(ws, 'subscription_success', {
      channel,
      message: `Subscribed to ${channel}`
    });
  }

  // Remove client
  removeClient(userId, ws) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).delete(ws);
      if (this.clients.get(userId).size === 0) {
        this.clients.delete(userId);
      }
    }
    console.log(`WebSocket client disconnected: ${userId}`);
  }

  // Send message to specific client
  sendToClient(ws, event, data) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  // Broadcast to specific user
  notifyUser(userId, event, data) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).forEach(ws => {
        this.sendToClient(ws, event, data);
      });
    }
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    this.clients.forEach((clientSet, userId) => {
      clientSet.forEach(ws => {
        this.sendToClient(ws, event, data);
      });
    });
  }

  // Real-time event handlers matching Supabase behavior
  notifyIssueUpdate(issueId, userId, updateData) {
    this.notifyUser(userId, 'issue_updated', {
      issueId,
      ...updateData,
      timestamp: new Date().toISOString()
    });
    
    // Also notify assigned user if different
    if (updateData.assigned_to && updateData.assigned_to !== userId) {
      this.notifyUser(updateData.assigned_to, 'issue_updated', {
        issueId,
        ...updateData,
        timestamp: new Date().toISOString()
      });
    }
  }

  notifyNewComment(issueId, userId, commentData) {
    this.notifyUser(userId, 'comment_added', {
      issueId,
      ...commentData,
      timestamp: new Date().toISOString()
    });
  }

  notifyAssignment(issueId, assignedUserId, assignmentData) {
    this.notifyUser(assignedUserId, 'issue_assigned', {
      issueId,
      ...assignmentData,
      timestamp: new Date().toISOString()
    });
  }

  notifyStatusChange(issueId, userId, statusData) {
    this.notifyUser(userId, 'status_changed', {
      issueId,
      ...statusData,
      timestamp: new Date().toISOString()
    });
  }

  // Keep connection alive with heartbeat
  startHeartbeat() {
    setInterval(() => {
      this.clients.forEach((clientSet, userId) => {
        clientSet.forEach(ws => {
          if (!ws.isAlive) {
            this.removeClient(userId, ws);
            ws.terminate();
            return;
          }
          
          ws.isAlive = false;
          ws.ping();
        });
      });
    }, 30000); // 30 seconds
  }

  // Get connection statistics
  getConnectionCount() {
    let count = 0;
    this.clients.forEach(clientSet => {
      count += clientSet.size;
    });
    return count;
  }

  getConnectedUsers() {
    return Array.from(this.clients.keys());
  }
}

module.exports = new RealTimeService();
