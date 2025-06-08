
const { pool } = require('../config/database');

class TATService {
  async getTATMetrics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;
      
      let query = `
        SELECT 
          CASE 
            WHEN DATEDIFF(
              COALESCE(closed_at, NOW()), 
              created_at
            ) <= 14 THEN '≤14 days'
            WHEN DATEDIFF(
              COALESCE(closed_at, NOW()), 
              created_at
            ) BETWEEN 15 AND 30 THEN '14-30 days'
            ELSE '>30 days'
          END as tat_bucket,
          COUNT(*) as count
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (startDate) {
        query += ' AND i.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        query += ' AND i.created_at <= ?';
        params.push(endDate);
      }
      
      if (city) {
        query += ' AND e.city = ?';
        params.push(city);
      }
      
      if (cluster) {
        query += ' AND e.cluster = ?';
        params.push(cluster);
      }
      
      query += ' GROUP BY tat_bucket';
      
      const [results] = await pool.execute(query, params);
      
      // Format results for frontend
      const tatData = {
        '≤14 days': 0,
        '14-30 days': 0,
        '>30 days': 0
      };
      
      results.forEach(row => {
        tatData[row.tat_bucket] = row.count;
      });
      
      return tatData;
    } catch (error) {
      console.error('Error calculating TAT metrics:', error);
      throw error;
    }
  }

  async getSLABreaches(filters = {}) {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE 
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) > 2 
            THEN 1 ELSE 0 
          END) as breached_issues
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const [results] = await pool.execute(query);
      const result = results[0];
      
      const breachPercentage = result.total_issues > 0 
        ? (result.breached_issues / result.total_issues) * 100 
        : 0;
      
      return {
        total: result.total_issues,
        breached: result.breached_issues,
        percentage: Math.round(breachPercentage * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating SLA breaches:', error);
      throw error;
    }
  }
}

module.exports = new TATService();
