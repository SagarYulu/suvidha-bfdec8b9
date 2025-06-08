
const { pool } = require('../config/database');

class FeedbackService {
  async submitFeedback(feedbackData) {
    try {
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

      // Map emoji feedback to sentiment scores
      const sentimentMapping = {
        '😊': 'positive',
        '😐': 'neutral', 
        '😞': 'negative'
      };

      const mappedSentiment = sentimentMapping[feedback_option] || sentiment;

      const query = `
        INSERT INTO ticket_feedback 
        (issue_id, employee_uuid, feedback_option, sentiment, agent_id, agent_name, city, cluster)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(query, [
        issue_id,
        employee_uuid,
        feedback_option,
        mappedSentiment,
        agent_id,
        agent_name,
        city,
        cluster
      ]);

      return {
        id: result.insertId,
        ...feedbackData,
        sentiment: mappedSentiment
      };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }

  async getFeedbackHistory(employeeId, options = {}) {
    try {
      const { page = 1, limit = 10, sentiment } = options;
      const offset = (page - 1) * limit;

      let query = `
        SELECT f.*, i.description as issue_description, i.status as issue_status
        FROM ticket_feedback f
        LEFT JOIN issues i ON f.issue_id = i.id
        WHERE f.employee_uuid = ?
      `;

      const params = [employeeId];

      if (sentiment) {
        query += ' AND f.sentiment = ?';
        params.push(sentiment);
      }

      query += ' ORDER BY f.created_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [feedback] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM ticket_feedback WHERE employee_uuid = ?';
      const countParams = [employeeId];

      if (sentiment) {
        countQuery += ' AND sentiment = ?';
        countParams.push(sentiment);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      return {
        feedback,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      throw error;
    }
  }

  async getFeedbackAnalytics(filters = {}) {
    try {
      const { dateRange, city, cluster } = filters;
      
      let query = `
        SELECT 
          sentiment,
          COUNT(*) as count,
          AVG(CASE 
            WHEN sentiment = 'positive' THEN 5
            WHEN sentiment = 'neutral' THEN 3
            WHEN sentiment = 'negative' THEN 1
            ELSE 3
          END) as avg_score
        FROM ticket_feedback f
        WHERE 1=1
      `;

      const params = [];

      if (dateRange) {
        const [startDate, endDate] = dateRange.split(',');
        query += ' AND f.created_at BETWEEN ? AND ?';
        params.push(startDate, endDate);
      }

      if (city) {
        query += ' AND f.city = ?';
        params.push(city);
      }

      if (cluster) {
        query += ' AND f.cluster = ?';
        params.push(cluster);
      }

      query += ' GROUP BY sentiment';

      const [results] = await pool.execute(query, params);

      // Calculate overall metrics
      const totalFeedback = results.reduce((sum, row) => sum + row.count, 0);
      const overallScore = results.reduce((sum, row) => sum + (row.avg_score * row.count), 0) / totalFeedback;

      return {
        distribution: results,
        totalFeedback,
        overallScore: Math.round(overallScore * 100) / 100,
        sentimentBreakdown: {
          positive: results.find(r => r.sentiment === 'positive')?.count || 0,
          neutral: results.find(r => r.sentiment === 'neutral')?.count || 0,
          negative: results.find(r => r.sentiment === 'negative')?.count || 0
        }
      };
    } catch (error) {
      console.error('Error fetching feedback analytics:', error);
      throw error;
    }
  }

  async getSentimentTrends(timeframe, filters = {}) {
    try {
      const { city, cluster } = filters;
      
      let dateCondition;
      switch (timeframe) {
        case '1month':
          dateCondition = 'DATE_SUB(NOW(), INTERVAL 1 MONTH)';
          break;
        case '3months':
          dateCondition = 'DATE_SUB(NOW(), INTERVAL 3 MONTH)';
          break;
        case '6months':
        default:
          dateCondition = 'DATE_SUB(NOW(), INTERVAL 6 MONTH)';
          break;
        case '1year':
          dateCondition = 'DATE_SUB(NOW(), INTERVAL 1 YEAR)';
          break;
      }

      let query = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          sentiment,
          COUNT(*) as count
        FROM ticket_feedback
        WHERE created_at >= ${dateCondition}
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

      query += ' GROUP BY month, sentiment ORDER BY month';

      const [results] = await pool.execute(query, params);

      return results;
    } catch (error) {
      console.error('Error fetching sentiment trends:', error);
      throw error;
    }
  }

  async getFeedbackByIssue(issueId) {
    try {
      const query = `
        SELECT f.*, e.name as employee_name
        FROM ticket_feedback f
        LEFT JOIN employees e ON f.employee_uuid = e.id
        WHERE f.issue_id = ?
        ORDER BY f.created_at DESC
      `;

      const [feedback] = await pool.execute(query, [issueId]);
      return feedback;
    } catch (error) {
      console.error('Error fetching feedback by issue:', error);
      throw error;
    }
  }

  async updateFeedback(id, updateData) {
    try {
      const { feedback_option, sentiment } = updateData;
      
      const query = `
        UPDATE ticket_feedback 
        SET feedback_option = ?, sentiment = ?, updated_at = NOW()
        WHERE id = ?
      `;

      const [result] = await pool.execute(query, [feedback_option, sentiment, id]);

      if (result.affectedRows === 0) {
        return null;
      }

      // Return updated feedback
      const [updated] = await pool.execute('SELECT * FROM ticket_feedback WHERE id = ?', [id]);
      return updated[0];
    } catch (error) {
      console.error('Error updating feedback:', error);
      throw error;
    }
  }

  async deleteFeedback(id) {
    try {
      const [result] = await pool.execute('DELETE FROM ticket_feedback WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting feedback:', error);
      throw error;
    }
  }
}

module.exports = new FeedbackService();
