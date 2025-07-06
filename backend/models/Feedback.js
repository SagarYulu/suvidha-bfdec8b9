
const { getPool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Feedback {
  static async create(feedbackData) {
    const pool = getPool();
    const {
      issue_id,
      employee_uuid,
      feedback_option,
      sentiment,
      agent_id,
      agent_name,
      city,
      cluster
    } = feedbackData;
    
    const feedbackId = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO ticket_feedback 
       (id, issue_id, employee_uuid, feedback_option, sentiment, 
        agent_id, agent_name, city, cluster, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [feedbackId, issue_id, employee_uuid, feedback_option, sentiment,
       agent_id, agent_name, city, cluster]
    );
    
    return this.findById(feedbackId);
  }

  static async findById(id) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT f.*, i.description as issue_description, e.emp_name as employee_name
       FROM ticket_feedback f
       LEFT JOIN issues i ON f.issue_id = i.id
       LEFT JOIN employees e ON f.employee_uuid = e.id
       WHERE f.id = ?`,
      [id]
    );
    
    return rows[0] || null;
  }

  static async findByIssueId(issueId) {
    const pool = getPool();
    const [rows] = await pool.execute(
      `SELECT f.*, e.emp_name as employee_name
       FROM ticket_feedback f
       LEFT JOIN employees e ON f.employee_uuid = e.id
       WHERE f.issue_id = ?
       ORDER BY f.created_at DESC`,
      [issueId]
    );
    
    return rows;
  }

  static async getAnalytics(filters = {}) {
    const pool = getPool();
    let query = `
      SELECT 
        sentiment,
        feedback_option,
        city,
        cluster,
        agent_name,
        COUNT(*) as count,
        DATE(created_at) as feedback_date
      FROM ticket_feedback 
      WHERE 1=1
    `;
    
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
    
    if (filters.agent_id) {
      query += ' AND agent_id = ?';
      params.push(filters.agent_id);
    }
    
    query += ' GROUP BY sentiment, feedback_option, city, cluster, agent_name, DATE(created_at)';
    query += ' ORDER BY feedback_date DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async getSentimentTrends(options = {}) {
    const pool = getPool();
    const { period = '30d', city, cluster } = options;
    
    let dateFilter = '';
    if (period === '7d') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === '30d') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    } else if (period === '90d') {
      dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)';
    }
    
    let query = `
      SELECT 
        DATE(created_at) as date,
        sentiment,
        COUNT(*) as count,
        AVG(CASE 
          WHEN sentiment = 'positive' THEN 1 
          WHEN sentiment = 'neutral' THEN 0 
          ELSE -1 
        END) as sentiment_score
      FROM ticket_feedback 
      WHERE 1=1 ${dateFilter}
    `;
    
    const params = [];
    
    if (city) {
      query += ' AND city = ?';
      params.push(city);
    }
    
    if (cluster) {
      query += ' AND cluster = ?';
      params.push(cluster);
    }
    
    query += ' GROUP BY DATE(created_at), sentiment ORDER BY date DESC';
    
    const [rows] = await pool.execute(query, params);
    return rows;
  }
}

module.exports = Feedback;
