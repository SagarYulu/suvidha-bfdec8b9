
const { pool } = require('../config/database');

class FeedbackModel {
  // Get all feedback with filters
  async getAllFeedback(filters = {}) {
    const { sentiment, city, cluster, issueId, agentId, startDate, endDate } = filters;
    
    let query = `
      SELECT 
        tf.*,
        i.type_id as issue_type,
        i.sub_type_id as issue_sub_type,
        e.name as employee_name,
        e.emp_id
      FROM ticket_feedback tf
      LEFT JOIN issues i ON tf.issue_id = i.id
      LEFT JOIN employees e ON tf.employee_uuid = e.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (sentiment) {
      query += ' AND tf.sentiment = ?';
      params.push(sentiment);
    }
    
    if (city) {
      query += ' AND tf.city = ?';
      params.push(city);
    }
    
    if (cluster) {
      query += ' AND tf.cluster = ?';
      params.push(cluster);
    }
    
    if (issueId) {
      query += ' AND tf.issue_id = ?';
      params.push(issueId);
    }
    
    if (agentId) {
      query += ' AND tf.agent_id = ?';
      params.push(agentId);
    }
    
    if (startDate) {
      query += ' AND tf.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND tf.created_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY tf.created_at DESC';
    
    const [feedback] = await pool.execute(query, params);
    return feedback;
  }

  // Get feedback by ID
  async getFeedbackById(id) {
    const query = `
      SELECT 
        tf.*,
        i.type_id as issue_type,
        i.sub_type_id as issue_sub_type,
        e.name as employee_name,
        e.emp_id
      FROM ticket_feedback tf
      LEFT JOIN issues i ON tf.issue_id = i.id
      LEFT JOIN employees e ON tf.employee_uuid = e.id
      WHERE tf.id = ?
    `;
    
    const [feedback] = await pool.execute(query, [id]);
    return feedback[0] || null;
  }

  // Create new feedback
  async createFeedback(feedbackData) {
    const {
      issueId,
      employeeUuid,
      sentiment,
      feedbackOption,
      agentId,
      agentName,
      city,
      cluster
    } = feedbackData;

    const query = `
      INSERT INTO ticket_feedback (
        issue_id, employee_uuid, sentiment, feedback_option, 
        agent_id, agent_name, city, cluster, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await pool.execute(query, [
      issueId, employeeUuid, sentiment, feedbackOption, agentId, agentName, city, cluster
    ]);

    return this.getFeedbackById(result.insertId);
  }

  // Update feedback
  async updateFeedback(id, updateData) {
    const allowedFields = ['sentiment', 'feedback_option', 'agent_id', 'agent_name'];
    
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }

    values.push(id);
    const query = `UPDATE ticket_feedback SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(query, values);

    return this.getFeedbackById(id);
  }

  // Delete feedback
  async deleteFeedback(id) {
    const query = 'DELETE FROM ticket_feedback WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  // Get feedback statistics
  async getFeedbackStats(filters = {}) {
    const { startDate, endDate, city, cluster } = filters;
    
    let query = `
      SELECT 
        COUNT(*) as total_feedback,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive_count,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral_count,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative_count,
        AVG(CASE 
          WHEN sentiment = 'positive' THEN 5
          WHEN sentiment = 'neutral' THEN 3
          WHEN sentiment = 'negative' THEN 1
          ELSE 3
        END) as avg_score
      FROM ticket_feedback
      WHERE 1=1
    `;
    
    const params = [];
    
    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }
    
    const [stats] = await pool.execute(query, params);
    return stats[0];
  }

  // Get feedback by agent
  async getFeedbackByAgent(agentId, filters = {}) {
    const { startDate, endDate } = filters;
    
    let query = `
      SELECT 
        tf.*,
        i.type_id as issue_type,
        e.name as employee_name
      FROM ticket_feedback tf
      LEFT JOIN issues i ON tf.issue_id = i.id
      LEFT JOIN employees e ON tf.employee_uuid = e.id
      WHERE tf.agent_id = ?
    `;
    
    const params = [agentId];
    
    if (startDate) {
      query += ' AND tf.created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      query += ' AND tf.created_at <= ?';
      params.push(endDate);
    }
    
    query += ' ORDER BY tf.created_at DESC';
    
    const [feedback] = await pool.execute(query, params);
    return feedback;
  }

  // Get sentiment distribution
  async getSentimentDistribution(filters = {}) {
    const { startDate, endDate, city, cluster } = filters;
    
    let query = `
      SELECT 
        sentiment,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM ticket_feedback WHERE 1=1
    `;
    
    const params = [];
    let whereClause = '';
    
    if (startDate) {
      whereClause += ' AND created_at >= ?';
      params.push(startDate);
    }
    
    if (endDate) {
      whereClause += ' AND created_at <= ?';
      params.push(endDate);
    }
    
    if (city) {
      whereClause += ' AND city = ?';
      params.push(city);
    }
    
    if (cluster) {
      whereClause += ' AND cluster = ?';
      params.push(cluster);
    }
    
    query += whereClause + ')), 2) as percentage FROM ticket_feedback WHERE 1=1' + whereClause;
    params.push(...params); // Duplicate params for the subquery
    
    query += ' GROUP BY sentiment';
    
    const [distribution] = await pool.execute(query, params);
    return distribution;
  }
}

module.exports = new FeedbackModel();
