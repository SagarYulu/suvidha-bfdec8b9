
const { pool } = require('../config/database');
const tatService = require('../services/actualTatService');

class ReportsController {
  async getTATReport(req, res) {
    try {
      const { startDate, endDate, city, cluster, groupBy = 'city' } = req.query;
      
      let whereClause = 'WHERE i.status IN ("resolved", "closed")';
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

      const groupColumn = groupBy === 'cluster' ? 'e.cluster' : 'e.city';

      const [tatData] = await pool.execute(`
        SELECT 
          ${groupColumn} as group_name,
          COUNT(*) as total_issues,
          AVG(TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at)) as avg_tat_hours,
          COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) <= 336 THEN 1 END) as within_14_days,
          COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) BETWEEN 337 AND 720 THEN 1 END) as between_14_30_days,
          COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) > 720 THEN 1 END) as above_30_days
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        ${whereClause}
        GROUP BY ${groupColumn}
        ORDER BY avg_tat_hours ASC
      `, params);

      res.json({
        success: true,
        data: {
          summary: tatData,
          groupBy: groupBy
        }
      });
    } catch (error) {
      console.error('Get TAT report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate TAT report'
      });
    }
  }

  async getSLAReport(req, res) {
    try {
      const { startDate, endDate, city, cluster } = req.query;
      
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

      const [slaData] = await pool.execute(`
        SELECT 
          e.city,
          e.cluster,
          i.priority,
          COUNT(*) as total_issues,
          COUNT(CASE WHEN i.escalated_at IS NOT NULL THEN 1 END) as escalated_issues,
          COUNT(CASE WHEN TIMESTAMPDIFF(HOUR, i.created_at, COALESCE(i.closed_at, NOW())) > 48 THEN 1 END) as sla_breached,
          AVG(TIMESTAMPDIFF(HOUR, i.created_at, COALESCE(i.closed_at, NOW()))) as avg_resolution_hours
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        ${whereClause}
        GROUP BY e.city, e.cluster, i.priority
        ORDER BY e.city, i.priority
      `, params);

      res.json({
        success: true,
        data: slaData
      });
    } catch (error) {
      console.error('Get SLA report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate SLA report'
      });
    }
  }

  async getTrendReport(req, res) {
    try {
      const { period = '30d', city, cluster } = req.query;
      
      let dateFilter;
      switch (period) {
        case '7d':
          dateFilter = 'DATE(i.created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
          break;
        case '30d':
          dateFilter = 'DATE(i.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
          break;
        case '90d':
          dateFilter = 'DATE(i.created_at) >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)';
          break;
        default:
          dateFilter = 'DATE(i.created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
      }

      let whereClause = `WHERE ${dateFilter}`;
      const params = [];

      if (city) {
        whereClause += ' AND e.city = ?';
        params.push(city);
      }

      if (cluster) {
        whereClause += ' AND e.cluster = ?';
        params.push(cluster);
      }

      const [trendData] = await pool.execute(`
        SELECT 
          DATE(i.created_at) as date,
          COUNT(*) as total_created,
          COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as total_resolved,
          AVG(CASE WHEN i.status IN ('resolved', 'closed') 
              THEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) END) as avg_resolution_time
        FROM issues i
        LEFT JOIN employees e ON i.employee_uuid = e.id
        ${whereClause}
        GROUP BY DATE(i.created_at)
        ORDER BY date ASC
      `, params);

      res.json({
        success: true,
        data: {
          trends: trendData,
          period: period
        }
      });
    } catch (error) {
      console.error('Get trend report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate trend report'
      });
    }
  }

  async getPerformanceReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      let whereClause = 'WHERE i.assigned_to IS NOT NULL';
      const params = [];

      if (startDate) {
        whereClause += ' AND i.created_at >= ?';
        params.push(startDate);
      }

      if (endDate) {
        whereClause += ' AND i.created_at <= ?';
        params.push(endDate);
      }

      const [performanceData] = await pool.execute(`
        SELECT 
          du.name as agent_name,
          du.role,
          COUNT(*) as total_assigned,
          COUNT(CASE WHEN i.status IN ('resolved', 'closed') THEN 1 END) as total_resolved,
          AVG(CASE WHEN i.status IN ('resolved', 'closed') 
              THEN TIMESTAMPDIFF(HOUR, i.created_at, i.closed_at) END) as avg_resolution_hours,
          COUNT(CASE WHEN i.escalated_at IS NOT NULL THEN 1 END) as escalated_count
        FROM issues i
        LEFT JOIN dashboard_users du ON i.assigned_to = du.id
        ${whereClause}
        GROUP BY du.id, du.name, du.role
        ORDER BY total_resolved DESC, avg_resolution_hours ASC
      `, params);

      res.json({
        success: true,
        data: performanceData
      });
    } catch (error) {
      console.error('Get performance report error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate performance report'
      });
    }
  }
}

module.exports = new ReportsController();
