
const { pool } = require('../config/database');

class TATService {
  async getTATMetrics(filters = {}) {
    try {
      const { startDate, endDate, city, cluster, priority } = filters;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (startDate) {
        whereClause += ' AND i.created_at >= ?';
        params.push(startDate);
      }
      
      if (endDate) {
        whereClause += ' AND i.created_at <= ?';
        params.push(endDate);
      }
      
      if (city) {
        whereClause += ' AND e.city = ?';
        params.push(city);
      }
      
      if (cluster) {
        whereClause += ' AND e.cluster = ?';
        params.push(cluster);
      }
      
      if (priority) {
        whereClause += ' AND i.priority = ?';
        params.push(priority);
      }

      const query = `
        SELECT 
          COUNT(*) as total_issues,
          AVG(DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at)) as avg_resolution_days,
          SUM(CASE WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) <= 14 THEN 1 ELSE 0 END) as within_14_days,
          SUM(CASE WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) BETWEEN 15 AND 30 THEN 1 ELSE 0 END) as between_15_30_days,
          SUM(CASE WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) > 30 THEN 1 ELSE 0 END) as over_30_days,
          SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN i.status != 'closed' THEN 1 ELSE 0 END) as pending_issues
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.emp_id
        ${whereClause}
      `;

      const [results] = await pool.execute(query, params);
      return results[0];
    } catch (error) {
      console.error('Error getting TAT metrics:', error);
      throw error;
    }
  }

  async getTATTrendData(days = 30) {
    try {
      const query = `
        SELECT 
          DATE(i.created_at) as date,
          COUNT(*) as total_issues,
          AVG(DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at)) as avg_tat,
          SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as resolved_count
        FROM issues i
        WHERE i.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY DATE(i.created_at)
        ORDER BY date DESC
      `;

      const [results] = await pool.execute(query, [days]);
      return results;
    } catch (error) {
      console.error('Error getting TAT trend data:', error);
      throw error;
    }
  }

  async getSLABreaches(filters = {}) {
    try {
      const { priority, assignedTo } = filters;
      
      let whereClause = 'WHERE DATEDIFF(NOW(), i.created_at) > 14';
      const params = [];
      
      if (priority) {
        whereClause += ' AND i.priority = ?';
        params.push(priority);
      }
      
      if (assignedTo) {
        whereClause += ' AND i.assigned_to = ?';
        params.push(assignedTo);
      }

      const query = `
        SELECT 
          i.*,
          e.name as employee_name,
          e.email as employee_email,
          DATEDIFF(NOW(), i.created_at) as days_open
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.emp_id
        ${whereClause}
        ORDER BY days_open DESC
      `;

      const [results] = await pool.execute(query, params);
      
      return {
        total: results.length,
        breached: results.length,
        issues: results
      };
    } catch (error) {
      console.error('Error getting SLA breaches:', error);
      throw error;
    }
  }

  async getTeamPerformance() {
    try {
      const query = `
        SELECT 
          i.assigned_to,
          du.name as agent_name,
          COUNT(*) as total_assigned,
          SUM(CASE WHEN i.status = 'closed' THEN 1 ELSE 0 END) as resolved_count,
          AVG(DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at)) as avg_resolution_time,
          SUM(CASE WHEN DATEDIFF(COALESCE(i.closed_at, NOW()), i.created_at) <= 14 THEN 1 ELSE 0 END) as within_sla
        FROM issues i
        LEFT JOIN dashboard_users du ON i.assigned_to = du.employee_id
        WHERE i.assigned_to IS NOT NULL
        GROUP BY i.assigned_to, du.name
        ORDER BY resolved_count DESC
      `;

      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error('Error getting team performance:', error);
      throw error;
    }
  }
}

module.exports = new TATService();
