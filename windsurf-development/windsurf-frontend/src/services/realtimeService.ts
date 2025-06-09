
import { apiClient } from '@/utils/apiClient';

interface ConnectionStats {
  totalConnections: number;
  authenticatedConnections: number;
  roleDistribution: Record<string, number>;
  activeChannels: string[];
}

interface NotificationPayload {
  userId: string;
  type: string;
  title: string;
  message: string;
}

interface BroadcastPayload {
  role: string;
  type: string;
  message: string;
}

interface SystemMessagePayload {
  type: string;
  message: string;
  targetRole?: string;
}

interface ChannelMessagePayload {
  channel: string;
  type: string;
  data: any;
}

interface IssueUpdatePayload {
  issueId: string;
  updateType: string;
  data: any;
}

export class RealtimeService {
  // Get WebSocket connection statistics
  static async getConnectionStats(): Promise<ConnectionStats> {
    const response = await apiClient.get<ConnectionStats>('/api/realtime/stats');
    return response.data;
  }

  // Send notification to specific user
  static async sendNotificationToUser(payload: NotificationPayload): Promise<any> {
    return apiClient.post('/api/realtime/notify/user', payload);
  }

  // Broadcast message to users with specific role
  static async broadcastToRole(payload: BroadcastPayload): Promise<any> {
    return apiClient.post('/api/realtime/broadcast/role', payload);
  }

  // Broadcast system message
  static async broadcastSystemMessage(payload: SystemMessagePayload): Promise<any> {
    return apiClient.post('/api/realtime/broadcast/system', payload);
  }

  // Send message to channel subscribers
  static async sendToChannel(payload: ChannelMessagePayload): Promise<any> {
    return apiClient.post('/api/realtime/send/channel', payload);
  }

  // Notify issue update
  static async notifyIssueUpdate(payload: IssueUpdatePayload): Promise<any> {
    return apiClient.post('/api/realtime/notify/issue-update', payload);
  }

  // Get active channels
  static async getActiveChannels(): Promise<string[]> {
    const response = await apiClient.get<{ channels: string[] }>('/api/realtime/channels');
    return response.data.channels;
  }

  // Get connected users info
  static async getConnectedUsers(): Promise<any> {
    return apiClient.get('/api/realtime/users/connected');
  }

  // Ping all connected clients
  static async pingClients(): Promise<any> {
    return apiClient.post('/api/realtime/ping');
  }

  // Health check for real-time services
  static async healthCheck(): Promise<any> {
    return apiClient.get('/api/realtime/health');
  }

  // Convenience methods for common notifications

  static async notifyIssueCreated(issueId: string, assigneeId?: string): Promise<void> {
    if (assigneeId) {
      await this.sendNotificationToUser({
        userId: assigneeId,
        type: 'issue_created',
        title: 'New Issue Assigned',
        message: `A new issue ${issueId} has been assigned to you`
      });
    }

    // Notify all managers about new issue
    await this.broadcastToRole({
      role: 'manager',
      type: 'issue_created',
      message: `New issue ${issueId} has been created`
    });
  }

  static async notifyStatusChange(issueId: string, oldStatus: string, newStatus: string, stakeholders: string[]): Promise<void> {
    // Notify issue stakeholders
    for (const userId of stakeholders) {
      await this.sendNotificationToUser({
        userId,
        type: 'status_change',
        title: 'Issue Status Updated',
        message: `Issue ${issueId} status changed from ${oldStatus} to ${newStatus}`
      });
    }

    // Broadcast to issue channel
    await this.sendToChannel({
      channel: `issue_${issueId}`,
      type: 'status_change',
      data: { issueId, oldStatus, newStatus }
    });
  }

  static async notifyNewComment(issueId: string, commentId: string, stakeholders: string[]): Promise<void> {
    // Notify stakeholders
    for (const userId of stakeholders) {
      await this.sendNotificationToUser({
        userId,
        type: 'new_comment',
        title: 'New Comment Added',
        message: `A new comment has been added to issue ${issueId}`
      });
    }

    // Send to issue channel
    await this.sendToChannel({
      channel: `issue_${issueId}`,
      type: 'new_comment',
      data: { issueId, commentId }
    });
  }

  static async notifyEscalation(issueId: string, escalatedToId: string, escalationType: string): Promise<void> {
    // Notify escalated user
    await this.sendNotificationToUser({
      userId: escalatedToId,
      type: 'escalation',
      title: 'Issue Escalated to You',
      message: `Issue ${issueId} has been escalated to you (${escalationType})`
    });

    // Notify managers about escalation
    await this.broadcastToRole({
      role: 'manager',
      type: 'escalation',
      message: `Issue ${issueId} has been escalated (${escalationType})`
    });
  }

  static async notifyTATWarning(issueId: string, assigneeId: string, daysElapsed: number): Promise<void> {
    // Notify assigned user
    if (assigneeId) {
      await this.sendNotificationToUser({
        userId: assigneeId,
        type: 'tat_warning',
        title: 'TAT Warning',
        message: `Issue ${issueId} is approaching TAT deadline (${daysElapsed} days elapsed)`
      });
    }

    // Notify managers for critical TAT issues
    if (daysElapsed > 14) {
      await this.broadcastToRole({
        role: 'manager',
        type: 'tat_warning',
        message: `Issue ${issueId} has breached TAT (${daysElapsed} days)`
      });
    }
  }

  static async notifySystemMaintenance(message: string, targetRole?: string): Promise<void> {
    await this.broadcastSystemMessage({
      type: 'system_maintenance',
      message,
      targetRole
    });
  }

  static async notifyBulkUpdate(affectedIssues: string[], updateType: string): Promise<void> {
    // Notify about bulk operations
    await this.broadcastToRole({
      role: 'admin',
      type: 'bulk_update',
      message: `Bulk ${updateType} completed for ${affectedIssues.length} issues`
    });

    // Send updates to affected issue channels
    for (const issueId of affectedIssues) {
      await this.sendToChannel({
        channel: `issue_${issueId}`,
        type: 'bulk_update',
        data: { issueId, updateType }
      });
    }
  }
}

export default RealtimeService;
