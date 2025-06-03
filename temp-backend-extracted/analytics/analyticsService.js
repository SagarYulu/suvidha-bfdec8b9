
// Analytics Service Logic
// Handles analytics calculations and data processing for exports

const { differenceInHours, format, subDays, startOfDay, endOfDay } = require('date-fns');

class AnalyticsService {
  constructor(dbConnection) {
    this.db = dbConnection;
  }

  async getAnalytics(filters = {}) {
    try {
      console.log('Fetching analytics with filters:', filters);
      
      // Build base query with filters
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      if (filters.status && filters.status !== 'all') {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.typeId && filters.typeId !== 'all') {
        whereClause += ' AND type_id = ?';
        params.push(filters.typeId);
      }
      
      if (filters.city && filters.city !== 'all') {
        whereClause += ' AND EXISTS (SELECT 1 FROM employees e WHERE e.user_id = issues.employee_uuid AND e.city = ?)';
        params.push(filters.city);
      }
      
      if (filters.cluster && filters.cluster !== 'all') {
        whereClause += ' AND EXISTS (SELECT 1 FROM employees e WHERE e.user_id = issues.employee_uuid AND e.cluster = ?)';
        params.push(filters.cluster);
      }

      // Get total issues
      const totalIssuesResult = await this.db.query(
        `SELECT COUNT(*) as count FROM issues ${whereClause}`,
        params
      );
      const totalIssues = totalIssuesResult[0]?.count || 0;

      // Get open issues
      const openIssuesResult = await this.db.query(
        `SELECT COUNT(*) as count FROM issues ${whereClause} AND status = 'open'`,
        params
      );
      const openIssues = openIssuesResult[0]?.count || 0;

      // Get closed issues for resolution rate
      const closedIssuesResult = await this.db.query(
        `SELECT COUNT(*) as count FROM issues ${whereClause} AND status = 'closed'`,
        params
      );
      const closedIssues = closedIssuesResult[0]?.count || 0;

      // Calculate resolution rate
      const resolutionRate = totalIssues > 0 ? (closedIssues / totalIssues) * 100 : 0;

      // Get average resolution time for closed issues
      const avgResolutionResult = await this.db.query(
        `SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, closed_at)) as avg_time 
         FROM issues ${whereClause} AND closed_at IS NOT NULL`,
        params
      );
      const avgResolutionTime = Math.round(avgResolutionResult[0]?.avg_time || 0);

      // Get issues by type
      const typeCountsResult = await this.db.query(
        `SELECT type_id, COUNT(*) as count FROM issues ${whereClause} GROUP BY type_id`,
        params
      );
      const typeCounts = {};
      typeCountsResult.forEach(row => {
        typeCounts[row.type_id] = row.count;
      });

      // Get issues by city
      const cityCountsResult = await this.db.query(
        `SELECT e.city, COUNT(*) as count 
         FROM issues i 
         JOIN employees e ON e.user_id = i.employee_uuid 
         ${whereClause.replace('WHERE 1=1', 'WHERE e.city IS NOT NULL')}
         GROUP BY e.city`,
        params
      );
      const cityCounts = {};
      cityCountsResult.forEach(row => {
        cityCounts[row.city] = row.count;
      });

      // Get issues by cluster
      const clusterCountsResult = await this.db.query(
        `SELECT e.cluster, COUNT(*) as count 
         FROM issues i 
         JOIN employees e ON e.user_id = i.employee_uuid 
         ${whereClause.replace('WHERE 1=1', 'WHERE e.cluster IS NOT NULL')}
         GROUP BY e.cluster`,
        params
      );
      const clusterCounts = {};
      clusterCountsResult.forEach(row => {
        clusterCounts[row.cluster] = row.count;
      });

      // Get issues by manager
      const managerCountsResult = await this.db.query(
        `SELECT e.manager, COUNT(*) as count 
         FROM issues i 
         JOIN employees e ON e.user_id = i.employee_uuid 
         ${whereClause.replace('WHERE 1=1', 'WHERE e.manager IS NOT NULL')}
         GROUP BY e.manager`,
        params
      );
      const managerCounts = {};
      managerCountsResult.forEach(row => {
        managerCounts[row.manager] = row.count;
      });

      // Calculate average first response time (mock for now)
      const avgFirstResponseTime = 4; // hours

      return {
        totalIssues,
        openIssues,
        resolutionRate,
        avgResolutionTime,
        avgFirstResponseTime,
        typeCounts,
        cityCounts,
        clusterCounts,
        managerCounts
      };

    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getIssuesForExport(filters = {}, dateRange = {}) {
    try {
      let whereClause = 'WHERE 1=1';
      const params = [];
      
      // Apply filters
      if (filters.status && filters.status !== 'all') {
        whereClause += ' AND i.status = ?';
        params.push(filters.status);
      }
      
      if (filters.typeId && filters.typeId !== 'all') {
        whereClause += ' AND i.type_id = ?';
        params.push(filters.typeId);
      }
      
      if (filters.city && filters.city !== 'all') {
        whereClause += ' AND e.city = ?';
        params.push(filters.city);
      }
      
      if (filters.cluster && filters.cluster !== 'all') {
        whereClause += ' AND e.cluster = ?';
        params.push(filters.cluster);
      }

      // Apply date range filters
      if (dateRange.from) {
        whereClause += ' AND i.created_at >= ?';
        params.push(dateRange.from);
      }
      
      if (dateRange.to) {
        whereClause += ' AND i.created_at <= ?';
        params.push(dateRange.to);
      }

      const query = `
        SELECT 
          i.*,
          e.name as employee_name,
          e.email as employee_email,
          e.manager,
          e.city,
          e.cluster,
          (SELECT COUNT(*) FROM issue_comments ic WHERE ic.issue_id = i.id) as comments_count,
          (SELECT COUNT(*) FROM issue_internal_comments iic WHERE iic.issue_id = i.id) as internal_comments_count
        FROM issues i
        LEFT JOIN employees e ON e.user_id = i.employee_uuid
        ${whereClause}
        ORDER BY i.created_at DESC
      `;

      const issues = await this.db.query(query, params);
      
      return issues.map(issue => ({
        id: issue.id,
        employeeUuid: issue.employee_uuid,
        employeeName: issue.employee_name,
        employeeEmail: issue.employee_email,
        typeId: issue.type_id,
        subTypeId: issue.sub_type_id,
        description: issue.description,
        status: issue.status,
        priority: issue.priority,
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        assignedTo: issue.assigned_to,
        mappedTypeId: issue.mapped_type_id,
        mappedSubTypeId: issue.mapped_sub_type_id,
        mappedAt: issue.mapped_at,
        mappedBy: issue.mapped_by,
        attachmentUrl: issue.attachment_url,
        manager: issue.manager,
        city: issue.city,
        cluster: issue.cluster,
        commentsCount: issue.comments_count || 0,
        internalCommentsCount: issue.internal_comments_count || 0
      }));

    } catch (error) {
      console.error('Error fetching issues for export:', error);
      throw error;
    }
  }

  async getTrendData(filters = {}, period = 'daily', days = 30) {
    try {
      console.log('Fetching trend data:', { filters, period, days });
      
      const endDate = new Date();
      const startDate = subDays(endDate, days);
      
      let groupBy = 'DATE(created_at)';
      let dateFormat = '%Y-%m-%d';
      
      if (period === 'weekly') {
        groupBy = 'YEARWEEK(created_at, 1)';
        dateFormat = 'Week %u, %Y';
      } else if (period === 'monthly') {
        groupBy = 'DATE_FORMAT(created_at, "%Y-%m")';
        dateFormat = '%Y-%m';
      }

      let whereClause = 'WHERE created_at >= ? AND created_at <= ?';
      const params = [startDate, endDate];
      
      if (filters.status && filters.status !== 'all') {
        whereClause += ' AND status = ?';
        params.push(filters.status);
      }
      
      if (filters.typeId && filters.typeId !== 'all') {
        whereClause += ' AND type_id = ?';
        params.push(filters.typeId);
      }

      const query = `
        SELECT 
          ${groupBy} as period,
          COUNT(*) as count,
          AVG(CASE 
            WHEN status = 'closed' AND closed_at IS NOT NULL 
            THEN TIMESTAMPDIFF(HOUR, created_at, closed_at) 
            ELSE NULL 
          END) as avg_resolution_time
        FROM issues 
        ${whereClause}
        GROUP BY ${groupBy}
        ORDER BY period
      `;

      const results = await this.db.query(query, params);
      
      return results.map(row => ({
        date: row.period,
        issues: row.count,
        avgResolutionTime: Math.round(row.avg_resolution_time || 0)
      }));

    } catch (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }
  }
}

module.exports = { AnalyticsService };
