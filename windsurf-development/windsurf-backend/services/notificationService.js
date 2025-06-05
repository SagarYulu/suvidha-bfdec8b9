
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class NotificationService {
  async createNotification(data) {
    const { userId, title, message, type = 'info', relatedEntityType, relatedEntityId } = data;
    
    const notificationId = uuidv4();
    
    await db.execute(`
      INSERT INTO notifications (
        id, user_id, title, message, type, related_entity_type, related_entity_id, 
        read_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, false, NOW())
    `, [notificationId, userId, title, message, type, relatedEntityType, relatedEntityId]);
    
    return notificationId;
  }

  async getUserNotifications(userId, limit = 50) {
    const [notifications] = await db.execute(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `, [userId, limit]);
    
    return notifications;
  }

  async markAsRead(notificationId, userId) {
    await db.execute(`
      UPDATE notifications 
      SET read_status = true, read_at = NOW() 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);
  }

  async markAllAsRead(userId) {
    await db.execute(`
      UPDATE notifications 
      SET read_status = true, read_at = NOW() 
      WHERE user_id = ? AND read_status = false
    `, [userId]);
  }

  async getUnreadCount(userId) {
    const [result] = await db.execute(`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND read_status = false
    `, [userId]);
    
    return result[0].count;
  }

  async deleteNotification(notificationId, userId) {
    await db.execute(`
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `, [notificationId, userId]);
  }

  // Auto-notification triggers
  async notifyIssueAssignment(issueId, assignedToUserId, assignedByUserId) {
    await this.createNotification({
      userId: assignedToUserId,
      title: 'New Issue Assigned',
      message: `Issue #${issueId} has been assigned to you`,
      type: 'info',
      relatedEntityType: 'issue',
      relatedEntityId: issueId
    });
  }

  async notifyIssueStatusChange(issueId, employeeId, newStatus) {
    await this.createNotification({
      userId: employeeId,
      title: 'Issue Status Updated',
      message: `Your issue #${issueId} status changed to ${newStatus}`,
      type: 'info',
      relatedEntityType: 'issue',
      relatedEntityId: issueId
    });
  }

  async notifyNewComment(issueId, employeeId, commenterName) {
    await this.createNotification({
      userId: employeeId,
      title: 'New Comment on Your Issue',
      message: `${commenterName} commented on your issue #${issueId}`,
      type: 'info',
      relatedEntityType: 'issue',
      relatedEntityId: issueId
    });
  }
}

module.exports = new NotificationService();
