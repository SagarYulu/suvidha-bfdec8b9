
const db = require('../config/database');

class TATService {
  // Calculate TAT in working hours (9 AM - 5 PM, Mon-Sat)
  calculateWorkingHours(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end <= start) return 0;
    
    const workingHoursPerDay = 8; // 9 AM to 5 PM
    const workingDaysPerWeek = 6; // Monday to Saturday
    
    let totalWorkingHours = 0;
    let currentDate = new Date(start);
    
    while (currentDate < end) {
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Skip Sundays (day 0)
      if (dayOfWeek !== 0) {
        const dayStart = new Date(currentDate);
        dayStart.setHours(9, 0, 0, 0); // 9 AM
        
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(17, 0, 0, 0); // 5 PM
        
        // Calculate overlap with working hours
        const effectiveStart = new Date(Math.max(start, dayStart));
        const effectiveEnd = new Date(Math.min(end, dayEnd));
        
        if (effectiveEnd > effectiveStart) {
          const hoursInDay = (effectiveEnd - effectiveStart) / (1000 * 60 * 60);
          totalWorkingHours += Math.min(hoursInDay, workingHoursPerDay);
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(0, 0, 0, 0);
    }
    
    return Math.round(totalWorkingHours * 100) / 100; // Round to 2 decimal places
  }
  
  // Get TAT bucket for given hours
  getTATBucket(hours) {
    if (hours <= 112) return '≤14 days'; // 14 days * 8 hours = 112 hours
    if (hours <= 240) return '14-30 days'; // 30 days * 8 hours = 240 hours
    return '>30 days';
  }
  
  // Calculate TAT metrics for issues
  async calculateTATMetrics(filters = {}) {
    try {
      let query = `
        SELECT 
          i.*,
          CASE 
            WHEN i.status IN ('resolved', 'closed') 
            THEN i.closed_at 
            ELSE NOW() 
          END as end_time
        FROM issues i 
        WHERE 1=1
      `;
      
      const params = [];
      
      // Apply filters
      if (filters.status) {
        query += ' AND i.status = ?';
        params.push(filters.status);
      }
      
      if (filters.priority) {
        query += ' AND i.priority = ?';
        params.push(filters.priority);
      }
      
      if (filters.dateRange) {
        query += ' AND i.created_at BETWEEN ? AND ?';
        params.push(filters.dateRange.start, filters.dateRange.end);
      }
      
      const [issues] = await db.execute(query, params);
      
      const tatMetrics = {
        buckets: {
          '≤14 days': 0,
          '14-30 days': 0,
          '>30 days': 0
        },
        totalIssues: issues.length,
        averageTAT: 0,
        resolvedIssues: 0,
        pendingIssues: 0
      };
      
      let totalTATHours = 0;
      let resolvedCount = 0;
      
      issues.forEach(issue => {
        const tatHours = this.calculateWorkingHours(issue.created_at, issue.end_time);
        const bucket = this.getTATBucket(tatHours);
        
        tatMetrics.buckets[bucket]++;
        totalTATHours += tatHours;
        
        if (issue.status === 'resolved' || issue.status === 'closed') {
          resolvedCount++;
        }
      });
      
      tatMetrics.averageTAT = issues.length > 0 ? 
        Math.round((totalTATHours / issues.length) * 100) / 100 : 0;
      tatMetrics.resolvedIssues = resolvedCount;
      tatMetrics.pendingIssues = issues.length - resolvedCount;
      
      return tatMetrics;
    } catch (error) {
      console.error('Error calculating TAT metrics:', error);
      throw error;
    }
  }
  
  // Get first response time metrics
  async calculateFirstResponseTime(filters = {}) {
    try {
      let query = `
        SELECT 
          i.id,
          i.created_at,
          MIN(c.created_at) as first_response_time
        FROM issues i
        LEFT JOIN issue_comments c ON i.id = c.issue_id
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.dateRange) {
        query += ' AND i.created_at BETWEEN ? AND ?';
        params.push(filters.dateRange.start, filters.dateRange.end);
      }
      
      query += ' GROUP BY i.id, i.created_at HAVING first_response_time IS NOT NULL';
      
      const [results] = await db.execute(query, params);
      
      let totalResponseHours = 0;
      const responseTimes = [];
      
      results.forEach(result => {
        const responseHours = this.calculateWorkingHours(
          result.created_at, 
          result.first_response_time
        );
        responseTimes.push(responseHours);
        totalResponseHours += responseHours;
      });
      
      return {
        averageFirstResponseTime: results.length > 0 ? 
          Math.round((totalResponseHours / results.length) * 100) / 100 : 0,
        totalResponded: results.length,
        responseTimes
      };
    } catch (error) {
      console.error('Error calculating first response time:', error);
      throw error;
    }
  }
  
  // Get resolution rate
  async calculateResolutionRate(filters = {}) {
    try {
      let query = `
        SELECT 
          COUNT(*) as total_issues,
          SUM(CASE WHEN status IN ('resolved', 'closed') THEN 1 ELSE 0 END) as resolved_issues
        FROM issues 
        WHERE 1=1
      `;
      
      const params = [];
      
      if (filters.dateRange) {
        query += ' AND created_at BETWEEN ? AND ?';
        params.push(filters.dateRange.start, filters.dateRange.end);
      }
      
      const [results] = await db.execute(query, params);
      const result = results[0];
      
      const resolutionRate = result.total_issues > 0 ? 
        (result.resolved_issues / result.total_issues) * 100 : 0;
      
      return {
        resolutionRate: Math.round(resolutionRate * 100) / 100,
        totalIssues: result.total_issues,
        resolvedIssues: result.resolved_issues
      };
    } catch (error) {
      console.error('Error calculating resolution rate:', error);
      throw error;
    }
  }
}

module.exports = new TATService();
