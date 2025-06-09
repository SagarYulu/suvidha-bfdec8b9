
const WebSocketService = require('../services/webSocketService');
const NotificationService = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/responseHelper');

class RealtimeController {
  async getConnectionStats(req, res) {
    try {
      const stats = WebSocketService.getStats();
      successResponse(res, stats, 'WebSocket statistics retrieved successfully');
    } catch (error) {
      console.error('Get connection stats error:', error);
      errorResponse(res, error.message);
    }
  }

  async sendNotificationToUser(req, res) {
    try {
      const { userId, type, title, message } = req.body;

      // Create notification in database
      const notification = await NotificationService.createNotification({
        user_id: userId,
        type,
        title,
        message
      });

      // Send via WebSocket
      const sent = WebSocketService.sendToUser(userId, {
        type: 'notification',
        data: notification
      });

      successResponse(res, {
        notification,
        realtime_sent: sent
      }, 'Notification sent successfully');
    } catch (error) {
      console.error('Send notification error:', error);
      errorResponse(res, error.message);
    }
  }

  async broadcastToRole(req, res) {
    try {
      const { role, type, message } = req.body;

      const sentCount = WebSocketService.sendToRole(role, {
        type: 'broadcast',
        role,
        message,
        timestamp: new Date().toISOString()
      });

      successResponse(res, {
        sent_to_count: sentCount,
        target_role: role
      }, 'Broadcast sent successfully');
    } catch (error) {
      console.error('Broadcast to role error:', error);
      errorResponse(res, error.message);
    }
  }

  async broadcastSystemMessage(req, res) {
    try {
      const { type, message, targetRole } = req.body;

      let sentCount;
      if (targetRole) {
        sentCount = WebSocketService.sendToRole(targetRole, {
          type: 'system_message',
          message,
          timestamp: new Date().toISOString()
        });
      } else {
        sentCount = WebSocketService.broadcast({
          type: 'system_message',
          message,
          timestamp: new Date().toISOString()
        });
      }

      successResponse(res, {
        sent_to_count: sentCount,
        target_role: targetRole || 'all'
      }, 'System message broadcast successfully');
    } catch (error) {
      console.error('Broadcast system message error:', error);
      errorResponse(res, error.message);
    }
  }

  async sendToChannel(req, res) {
    try {
      const { channel, type, data } = req.body;

      const sentCount = WebSocketService.sendToChannel(channel, {
        type,
        data,
        channel,
        timestamp: new Date().toISOString()
      });

      successResponse(res, {
        sent_to_count: sentCount,
        channel
      }, 'Message sent to channel successfully');
    } catch (error) {
      console.error('Send to channel error:', error);
      errorResponse(res, error.message);
    }
  }

  async notifyIssueUpdate(req, res) {
    try {
      const { issueId, updateType, data } = req.body;

      WebSocketService.notifyIssueUpdate(issueId, updateType, data);

      successResponse(res, {
        issue_id: issueId,
        update_type: updateType
      }, 'Issue update notification sent');
    } catch (error) {
      console.error('Notify issue update error:', error);
      errorResponse(res, error.message);
    }
  }

  async getActiveChannels(req, res) {
    try {
      const channels = WebSocketService.getActiveChannels();
      successResponse(res, { channels }, 'Active channels retrieved successfully');
    } catch (error) {
      console.error('Get active channels error:', error);
      errorResponse(res, error.message);
    }
  }

  async getConnectedUsers(req, res) {
    try {
      // This would require implementing user tracking in WebSocketService
      const stats = WebSocketService.getStats();
      
      // Return basic connection info for now
      const result = {
        total_connections: stats.totalConnections,
        authenticated_connections: stats.authenticatedConnections,
        role_distribution: stats.roleDistribution
      };

      successResponse(res, result, 'Connected users information retrieved successfully');
    } catch (error) {
      console.error('Get connected users error:', error);
      errorResponse(res, error.message);
    }
  }

  async pingClients(req, res) {
    try {
      const sentCount = WebSocketService.broadcast({
        type: 'ping',
        timestamp: new Date().toISOString()
      });

      successResponse(res, {
        pinged_clients: sentCount
      }, 'Ping sent to all clients');
    } catch (error) {
      console.error('Ping clients error:', error);
      errorResponse(res, error.message);
    }
  }

  // Health check for real-time services
  async healthCheck(req, res) {
    try {
      const stats = WebSocketService.getStats();
      
      const health = {
        websocket_server: 'healthy',
        total_connections: stats.totalConnections,
        authenticated_connections: stats.authenticatedConnections,
        active_channels: stats.activeChannels.length,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      };

      successResponse(res, health, 'Real-time service health check completed');
    } catch (error) {
      console.error('Real-time health check error:', error);
      errorResponse(res, 'Real-time service health check failed', 500);
    }
  }
}

module.exports = new RealtimeController();
