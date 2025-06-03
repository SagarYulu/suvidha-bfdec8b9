
// Feedback Service Logic
// Original file: src/services/ticketFeedbackService.ts

class FeedbackService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async submitFeedback(feedbackData) {
    try {
      const feedbackId = this.generateUUID();
      
      await this.db.query(
        `INSERT INTO ticket_feedback (
          id, issue_id, employee_uuid, sentiment, feedback_option,
          cluster, city, agent_id, agent_name, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          feedbackId,
          feedbackData.issueId,
          feedbackData.employeeUuid,
          feedbackData.sentiment,
          feedbackData.feedbackOption,
          feedbackData.cluster,
          feedbackData.city,
          feedbackData.agentId,
          feedbackData.agentName
        ]
      );

      return feedbackId;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return null;
    }
  }

  async getFeedbackByIssueId(issueId) {
    try {
      const feedback = await this.db.query(
        'SELECT * FROM ticket_feedback WHERE issue_id = ?',
        [issueId]
      );
      
      return feedback;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      return null;
    }
  }

  async getFeedbackAnalytics(filters = {}) {
    try {
      let query = 'SELECT * FROM ticket_feedback WHERE 1=1';
      const params = [];

      if (filters.startDate) {
        query += ' AND created_at >= ?';
        params.push(filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND created_at <= ?';
        params.push(filters.endDate);
      }

      if (filters.city) {
        query += ' AND city = ?';
        params.push(filters.city);
      }

      if (filters.cluster) {
        query += ' AND cluster = ?';
        params.push(filters.cluster);
      }

      if (filters.sentiment) {
        query += ' AND sentiment = ?';
        params.push(filters.sentiment);
      }

      query += ' ORDER BY created_at DESC';

      const feedback = await this.db.query(query, params);
      return feedback || [];
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      return [];
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

module.exports = { FeedbackService };
