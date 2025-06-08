
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
      const { startDate, endDate, city, cluster } = filters;
      
      let query = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE 
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) > 
              CASE priority
                WHEN 'critical' THEN 1
                WHEN 'high' THEN 3
                WHEN 'medium' THEN 7
                ELSE 14
              END
            THEN 1 ELSE 0 
          END) as breached_issues
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
      
      const [results] = await pool.execute(query, params);
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

  async getAvgResolutionTime(filters = {}) {
    try {
      const { startDate, endDate, city, cluster } = filters;
      
      let query = `
        SELECT 
          AVG(DATEDIFF(closed_at, created_at)) as avg_days,
          COUNT(*) as resolved_count
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.status IN ('resolved', 'closed') AND i.closed_at IS NOT NULL
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
      
      const [results] = await pool.execute(query, params);
      const result = results[0];
      
      return {
        avgDays: Math.round((result.avg_days || 0) * 100) / 100,
        resolvedCount: result.resolved_count || 0
      };
    } catch (error) {
      console.error('Error calculating average resolution time:', error);
      throw error;
    }
  }

  async getTrendData(period = '30d', filters = {}) {
    try {
      const { city, cluster } = filters;
      
      let query = `
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_issues,
          SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as resolved_issues,
          AVG(CASE 
            WHEN closed_at IS NOT NULL 
            THEN DATEDIFF(closed_at, created_at) 
            ELSE NULL 
          END) as avg_resolution_days
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      
      const params = [];
      
      if (city) {
        query += ' AND e.city = ?';
        params.push(city);
      }
      
      if (cluster) {
        query += ' AND e.cluster = ?';
        params.push(cluster);
      }
      
      query += ' GROUP BY DATE(created_at) ORDER BY date';
      
      const [results] = await pool.execute(query, params);
      
      return results.map(row => ({
        date: row.date,
        totalIssues: row.total_issues,
        resolvedIssues: row.resolved_issues,
        avgResolutionDays: Math.round((row.avg_resolution_days || 0) * 100) / 100
      }));
    } catch (error) {
      console.error('Error getting trend data:', error);
      throw error;
    }
  }
}

module.exports = new TATService();
