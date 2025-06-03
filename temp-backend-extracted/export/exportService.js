
// Export Service Logic
// Handles data export functionality for analytics and issues

class ExportService {
  constructor(dbConnection, analyticsService) {
    this.db = dbConnection;
    this.analyticsService = analyticsService;
  }

  async exportIssuesData(filters = {}, dateRange = {}) {
    try {
      console.log('Exporting issues data with filters:', filters, 'dateRange:', dateRange);
      
      const issues = await this.analyticsService.getIssuesForExport(filters, dateRange);
      
      if (issues.length === 0) {
        throw new Error('No issues found to export');
      }

      // Format data for CSV export
      const formattedData = issues.map(issue => ({
        'Issue ID': issue.id,
        'Employee UUID': issue.employeeUuid,
        'Employee Name': issue.employeeName || '',
        'Employee Email': issue.employeeEmail || '',
        'Manager': issue.manager || '',
        'City': issue.city || '',
        'Cluster': issue.cluster || '',
        'Type ID': issue.typeId,
        'Sub Type ID': issue.subTypeId,
        'Description': issue.description,
        'Status': issue.status,
        'Priority': issue.priority,
        'Created At': this.formatDate(issue.createdAt),
        'Updated At': this.formatDate(issue.updatedAt),
        'Closed At': issue.closedAt ? this.formatDate(issue.closedAt) : '',
        'Assigned To': issue.assignedTo || '',
        'Mapped Type ID': issue.mappedTypeId || '',
        'Mapped Sub Type ID': issue.mappedSubTypeId || '',
        'Mapped At': issue.mappedAt ? this.formatDate(issue.mappedAt) : '',
        'Mapped By': issue.mappedBy || '',
        'Comments Count': issue.commentsCount,
        'Internal Comments Count': issue.internalCommentsCount,
        'Has Attachments': issue.attachmentUrl ? 'Yes' : 'No',
        'Attachment URL': issue.attachmentUrl || ''
      }));

      return {
        data: formattedData,
        filename: this.generateIssuesFilename(dateRange),
        count: issues.length
      };

    } catch (error) {
      console.error('Error exporting issues data:', error);
      throw error;
    }
  }

  async exportAnalyticsSummary(filters = {}) {
    try {
      console.log('Exporting analytics summary with filters:', filters);
      
      const analytics = await this.analyticsService.getAnalytics(filters);
      
      if (!analytics) {
        throw new Error('No analytics data available');
      }

      const summaryData = [];

      // Main Metrics Section
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Total Issues',
        'Value': analytics.totalIssues || 0,
        'Description': 'Total number of issues in the system',
        'Unit': 'count'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Open Issues',
        'Value': analytics.openIssues || 0,
        'Description': 'Number of issues currently open',
        'Unit': 'count'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Resolution Rate',
        'Value': analytics.resolutionRate?.toFixed(1) || 0,
        'Description': 'Percentage of issues that have been resolved',
        'Unit': 'percentage'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Average Resolution Time',
        'Value': analytics.avgResolutionTime || 0,
        'Description': 'Average time taken to resolve issues',
        'Unit': 'hours'
      });
      
      summaryData.push({
        'Section': 'Main Metrics',
        'Metric': 'Average First Response Time',
        'Value': analytics.avgFirstResponseTime || 0,
        'Description': 'Average time taken for first response to issues',
        'Unit': 'hours'
      });

      // Issues by Type Section
      if (analytics.typeCounts) {
        Object.entries(analytics.typeCounts).forEach(([type, count]) => {
          summaryData.push({
            'Section': 'Issues by Type',
            'Metric': type,
            'Value': count,
            'Description': `Number of issues of type ${type}`,
            'Unit': 'count'
          });
        });
      }

      // Issues by City Section
      if (analytics.cityCounts) {
        Object.entries(analytics.cityCounts).forEach(([city, count]) => {
          summaryData.push({
            'Section': 'Issues by City',
            'Metric': city,
            'Value': count,
            'Description': `Number of issues from ${city}`,
            'Unit': 'count'
          });
        });
      }

      // Issues by Cluster Section
      if (analytics.clusterCounts) {
        Object.entries(analytics.clusterCounts).forEach(([cluster, count]) => {
          summaryData.push({
            'Section': 'Issues by Cluster',
            'Metric': cluster,
            'Value': count,
            'Description': `Number of issues from ${cluster} cluster`,
            'Unit': 'count'
          });
        });
      }

      // Issues by Manager Section
      if (analytics.managerCounts) {
        Object.entries(analytics.managerCounts).forEach(([manager, count]) => {
          summaryData.push({
            'Section': 'Issues by Manager',
            'Metric': manager,
            'Value': count,
            'Description': `Number of issues under manager ${manager}`,
            'Unit': 'count'
          });
        });
      }

      return {
        data: summaryData,
        filename: this.generateAnalyticsFilename(),
        count: summaryData.length
      };

    } catch (error) {
      console.error('Error exporting analytics summary:', error);
      throw error;
    }
  }

  formatDate(dateString) {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().replace('T', ' ').substring(0, 19);
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return dateString;
    }
  }

  generateIssuesFilename(dateRange = {}) {
    let filename = 'issues-export';
    
    if (dateRange.from || dateRange.to) {
      const fromStr = dateRange.from ? this.formatDateForFilename(dateRange.from) : 'start';
      const toStr = dateRange.to ? this.formatDateForFilename(dateRange.to) : 'end';
      filename += `-${fromStr}-to-${toStr}`;
    }
    
    filename += `-${this.formatDateForFilename(new Date())}.csv`;
    return filename;
  }

  generateAnalyticsFilename() {
    return `analytics-summary-${this.formatDateForFilename(new Date())}.csv`;
  }

  formatDateForFilename(date) {
    if (!date) return '';
    
    try {
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    } catch (error) {
      console.error('Error formatting date for filename:', date, error);
      return 'unknown-date';
    }
  }
}

module.exports = { ExportService };
