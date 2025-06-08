
const { pool } = require('../config/database');

class MobileService {
  async getEmployeeIssuesByStatus(employeeId, status = null) {
    let query = `
      SELECT 
        i.*,
        e.name as employee_name,
        da.name as assigned_to_name,
        COUNT(ic.id) as comment_count
      FROM issues i
      LEFT JOIN employees e ON i.employee_id = e.id
      LEFT JOIN dashboard_users da ON i.assigned_to = da.id
      LEFT JOIN issue_comments ic ON i.id = ic.issue_id
      WHERE i.employee_id = ?
    `;
    
    const params = [employeeId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    query += ' GROUP BY i.id ORDER BY i.updated_at DESC';

    const [issues] = await pool.execute(query, params);
    return issues;
  }

  async getIssueAnalytics(employeeId) {
    const [analytics] = await pool.execute(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as issue_count,
        status,
        priority
      FROM issues 
      WHERE employee_id = ?
      AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at), status, priority
      ORDER BY date DESC
    `, [employeeId]);

    return analytics;
  }

  async getRecentActivity(employeeId, limit = 10) {
    const [activities] = await pool.execute(`
      SELECT 
        'issue_created' as activity_type,
        i.title as description,
        i.created_at as timestamp
      FROM issues i
      WHERE i.employee_id = ?
      
      UNION ALL
      
      SELECT 
        'comment_added' as activity_type,
        CONCAT('Comment on: ', i.title) as description,
        ic.created_at as timestamp
      FROM issue_comments ic
      JOIN issues i ON ic.issue_id = i.id
      WHERE ic.employee_id = ?
      
      ORDER BY timestamp DESC
      LIMIT ?
    `, [employeeId, employeeId, limit]);

    return activities;
  }

  async createIssueWithNotification(issueData) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create issue
      const [result] = await connection.execute(`
        INSERT INTO issues (
          title,
          description,
          priority,
          category,
          employee_id,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, 'open', NOW())
      `, [
        issueData.title,
        issueData.description,
        issueData.priority,
        issueData.category,
        issueData.employee_id
      ]);

      const issueId = result.insertId;

      // Create notification for admin
      await connection.execute(`
        INSERT INTO notifications (
          type,
          title,
          message,
          target_user_type,
          reference_id,
          created_at
        ) VALUES (
          'new_issue',
          'New Issue Created',
          ?,
          'admin',
          ?,
          NOW()
        )
      `, [
        `New issue "${issueData.title}" has been created`,
        issueId
      ]);

      await connection.commit();
      return { id: issueId, ...issueData };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async updateIssueStatus(issueId, status, updatedBy) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Update issue status
      await connection.execute(`
        UPDATE issues 
        SET status = ?, updated_at = NOW(), updated_by = ?
        WHERE id = ?
      `, [status, updatedBy, issueId]);

      // Get issue details for notification
      const [issues] = await connection.execute(`
        SELECT title, employee_id FROM issues WHERE id = ?
      `, [issueId]);

      if (issues.length > 0) {
        // Create notification for employee
        await connection.execute(`
          INSERT INTO notifications (
            type,
            title,
            message,
            target_user_id,
            reference_id,
            created_at
          ) VALUES (
            'status_update',
            'Issue Status Updated',
            ?,
            ?,
            ?,
            NOW()
          )
        `, [
          `Your issue "${issues[0].title}" status has been updated to ${status}`,
          issues[0].employee_id,
          issueId
        ]);
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getEmployeeNotifications(employeeId, unreadOnly = false) {
    let query = `
      SELECT 
        id,
        type,
        title,
        message,
        is_read,
        created_at
      FROM notifications 
      WHERE target_user_id = ?
    `;
    
    const params = [employeeId];

    if (unreadOnly) {
      query += ' AND is_read = 0';
    }

    query += ' ORDER BY created_at DESC LIMIT 50';

    const [notifications] = await pool.execute(query, params);
    return notifications;
  }

  async markNotificationAsRead(notificationId) {
    await pool.execute(`
      UPDATE notifications 
      SET is_read = 1, read_at = NOW()
      WHERE id = ?
    `, [notificationId]);
  }
}

module.exports = new MobileService();
