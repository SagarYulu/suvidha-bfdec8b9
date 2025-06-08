
const db = require('../config/database');

class TATService {
  // Calculate TAT buckets: ≤14, 14-30, >30 days
  async getTATBuckets(filters = {}) {
    try {
      let query = `
        SELECT 
          CASE 
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) <= 14 THEN '≤14 days'
            WHEN DATEDIFF(COALESCE(closed_at, NOW()), created_at) BETWEEN 15 AND 30 THEN '14-30 days'
            ELSE '>30 days'
          END as bucket,
          COUNT(*) as count
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.city) {
        query += ' AND city = ?';
        params.push(filters.city);
      }
      
      query += ' GROUP BY bucket';
      
      const [rows] = await db.execute(query, params);
      
      // Convert to expected format
      const buckets = {
        '≤14 days': 0,
        '14-30 days': 0,
        '>30 days': 0
      };
      
      rows.forEach(row => {
        buckets[row.bucket] = row.count;
      });
      
      return {
        buckets,
        totalIssues: Object.values(buckets).reduce((sum, count) => sum + count, 0)
      };
    } catch (error) {
      console.error('Error calculating TAT buckets:', error);
      throw error;
    }
  }
  
  // Calculate average TAT
  async getAverageTAT(filters = {}) {
    try {
      let query = `
        SELECT 
          AVG(DATEDIFF(COALESCE(closed_at, NOW()), created_at)) as average_tat,
          COUNT(*) as total_issues,
          SUM(CASE WHEN closed_at IS NOT NULL THEN 1 ELSE 0 END) as resolved_issues,
          SUM(CASE WHEN closed_at IS NULL THEN 1 ELSE 0 END) as pending_issues
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.dateFrom) {
        query += ' AND created_at >= ?';
        params.push(filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query += ' AND created_at <= ?';
        params.push(filters.dateTo);
      }
      
      if (filters.city) {
        query += ' AND city = ?';
        params.push(filters.city);
      }
      
      const [rows] = await db.execute(query, params);
      const result = rows[0];
      
      return {
        averageTAT: Math.round(result.average_tat || 0),
        totalIssues: result.total_issues || 0,
        resolvedIssues: result.resolved_issues || 0,
        pendingIssues: result.pending_issues || 0
      };
    } catch (error) {
      console.error('Error calculating average TAT:', error);
      throw error;
    }
  }
  
  // Get SLA breach alerts (issues older than configured threshold)
  async getSLABreaches(slaThresholdHours = 48) {
    try {
      const query = `
        SELECT 
          id,
          employee_uuid,
          type_id,
          sub_type_id,
          priority,
          status,
          created_at,
          TIMESTAMPDIFF(HOUR, created_at, NOW()) as hours_open
        FROM issues 
        WHERE status IN ('open', 'in_progress')
          AND TIMESTAMPDIFF(HOUR, created_at, NOW()) > ?
        ORDER BY created_at ASC
      `;
      
      const [rows] = await db.execute(query, [slaThresholdHours]);
      return rows;
    } catch (error) {
      console.error('Error getting SLA breaches:', error);
      throw error;
    }
  }
  
  // Get TAT metrics for dashboard
  async getDashboardTATMetrics(filters = {}) {
    try {
      const [bucketsData, averageData] = await Promise.all([
        this.getTATBuckets(filters),
        this.getAverageTAT(filters)
      ]);
      
      return {
        ...bucketsData,
        ...averageData
      };
    } catch (error) {
      console.error('Error getting dashboard TAT metrics:', error);
      throw error;
    }
  }
  
  // Check if issue breaches SLA
  async checkSLABreach(issueId, slaThresholdHours = 48) {
    try {
      const query = `
        SELECT 
          id,
          created_at,
          status,
          TIMESTAMPDIFF(HOUR, created_at, NOW()) as hours_open
        FROM issues 
        WHERE id = ?
      `;
      
      const [rows] = await db.execute(query, [issueId]);
      
      if (rows.length === 0) {
        return null;
      }
      
      const issue = rows[0];
      const isBreached = issue.hours_open > slaThresholdHours && 
                        ['open', 'in_progress'].includes(issue.status);
      
      return {
        ...issue,
        isBreached,
        hoursRemaining: isBreached ? 0 : Math.max(0, slaThresholdHours - issue.hours_open)
      };
    } catch (error) {
      console.error('Error checking SLA breach:', error);
      throw error;
    }
  }
}

module.exports = new TATService();
