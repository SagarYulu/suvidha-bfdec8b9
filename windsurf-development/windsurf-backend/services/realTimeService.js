const EventEmitter = require('events');

class RealTimeService extends EventEmitter {
  constructor() {
    super();
    this.clients = new Map(); // userId -> Set of response objects
    this.setMaxListeners(0); // Remove listener limit
  }

  // Add client for SSE connection
  addClient(userId, res) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(res);

    // Setup SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    // Send initial connection message
    this.sendToClient(res, 'connected', { message: 'Real-time connection established' });

    // Handle client disconnect
    res.on('close', () => {
      this.removeClient(userId, res);
    });

    // Keep connection alive
    const heartbeat = setInterval(() => {
      if (res.destroyed) {
        clearInterval(heartbeat);
        return;
      }
      this.sendToClient(res, 'heartbeat', { timestamp: new Date().toISOString() });
    }, 30000); // 30 seconds
  }

  // Remove client
  removeClient(userId, res) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).delete(res);
      if (this.clients.get(userId).size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  // Send message to specific client
  sendToClient(res, event, data) {
    try {
      if (!res.destroyed) {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      }
    } catch (error) {
      console.error('Error sending SSE message:', error);
    }
  }

  // Broadcast to specific user
  notifyUser(userId, event, data) {
    if (this.clients.has(userId)) {
      this.clients.get(userId).forEach(res => {
        this.sendToClient(res, event, data);
      });
    }
  }

  // Broadcast to all connected clients
  broadcast(event, data) {
    this.clients.forEach((clientSet, userId) => {
      clientSet.forEach(res => {
        this.sendToClient(res, event, data);
      });
    });
  }

  // Notify about issue updates
  notifyIssueUpdate(issueId, userId, updateData) {
    this.notifyUser(userId, 'issue_updated', {
      issueId,
      ...updateData,
      timestamp: new Date().toISOString()
    });
  }

  // Notify about new comments
  notifyNewComment(issueId, userId, commentData) {
    this.notifyUser(userId, 'comment_added', {
      issueId,
      ...commentData,
      timestamp: new Date().toISOString()
    });
  }

  // Notify about assignment changes
  notifyAssignment(issueId, assignedUserId, assignmentData) {
    this.notifyUser(assignedUserId, 'issue_assigned', {
      issueId,
      ...assignmentData,
      timestamp: new Date().toISOString()
    });
  }

  // Notify about status changes
  notifyStatusChange(issueId, userId, statusData) {
    this.notifyUser(userId, 'status_changed', {
      issueId,
      ...statusData,
      timestamp: new Date().toISOString()
    });
  }

  // Get connection count
  getConnectionCount() {
    let count = 0;
    this.clients.forEach(clientSet => {
      count += clientSet.size;
    });
    return count;
  }

  // Get connected users
  getConnectedUsers() {
    return Array.from(this.clients.keys());
  }
}

module.exports = new RealTimeService();
