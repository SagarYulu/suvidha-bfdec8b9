
const db = require('../config/database');

class FeedbackModel {
  static async create(feedbackData) {
    const query = `
      INSERT INTO feedback (id, issue_id, employee_uuid, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    
    const [result] = await db.execute(query, [
      feedbackData.id,
      feedbackData.issue_id,
      feedbackData.employee_uuid,
      feedbackData.rating,
      feedbackData.comment
    ]);
    
    return this.findById(feedbackData.id);
  }

  static async findById(id) {
    const query = `
      SELECT f.*, i.description as issue_description, e.name as employee_name
      FROM feedback f
      LEFT JOIN issues i ON f.issue_id = i.id
      LEFT JOIN employees e ON f.employee_uuid = e.uuid
      WHERE f.id = ?
    `;
    
    const [rows] = await db.execute(query, [id]);
    return rows[0] || null;
  }

  static async findByIssueId(issueId) {
    const query = `
      SELECT f.*, e.name as employee_name
      FROM feedback f
      LEFT JOIN employees e ON f.employee_uuid = e.uuid
      WHERE f.issue_id = ?
      ORDER BY f.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [issueId]);
    return rows;
  }

  static async getAverageRating(issueId) {
    const query = `
      SELECT AVG(rating) as average_rating, COUNT(*) as total_feedback
      FROM feedback
      WHERE issue_id = ?
    `;
    
    const [rows] = await db.execute(query, [issueId]);
    return rows[0];
  }

  static async getFeedbackStats(filters = {}) {
    let query = `
      SELECT 
        AVG(rating) as average_rating,
        COUNT(*) as total_feedback,
        SUM(CASE WHEN rating >= 4 THEN 1 ELSE 0 END) as positive_feedback,
        SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) as negative_feedback
      FROM feedback f
      LEFT JOIN issues i ON f.issue_id = i.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (filters.startDate) {
      query += ' AND f.created_at >= ?';
      params.push(filters.startDate);
    }
    
    if (filters.endDate) {
      query += ' AND f.created_at <= ?';
      params.push(filters.endDate);
    }
    
    if (filters.assigned_to) {
      query += ' AND i.assigned_to = ?';
      params.push(filters.assigned_to);
    }
    
    const [rows] = await db.execute(query, params);
    return rows[0];
  }
}

module.exports = FeedbackModel;
