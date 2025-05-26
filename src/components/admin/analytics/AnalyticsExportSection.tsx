import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';
import { exportToCSV } from '@/utils/csvExportUtils';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AnalyticsExportSectionProps {
  issues: any[];
  analytics: any;
  filters: any;
  dateRange: { from?: Date; to?: Date };
}

const AnalyticsExportSection: React.FC<AnalyticsExportSectionProps> = ({
  issues,
  analytics,
  filters,
  dateRange
}) => {

  const formatIssueForExport = (issue: any) => {
    return {
      'Issue ID': issue.id,
      'Employee UUID': issue.employee_uuid,
      'Type ID': issue.type_id,
      'Sub Type ID': issue.sub_type_id,
      'Description': issue.description,
      'Status': issue.status,
      'Priority': issue.priority,
      'Created At': format(new Date(issue.created_at), 'yyyy-MM-dd HH:mm:ss'),
      'Updated At': format(new Date(issue.updated_at), 'yyyy-MM-dd HH:mm:ss'),
      'Closed At': issue.closed_at ? format(new Date(issue.closed_at), 'yyyy-MM-dd HH:mm:ss') : '',
      'Assigned To': issue.assigned_to || '',
      'Mapped Type ID': issue.mapped_type_id || '',
      'Mapped Sub Type ID': issue.mapped_sub_type_id || '',
      'Mapped At': issue.mapped_at ? format(new Date(issue.mapped_at), 'yyyy-MM-dd HH:mm:ss') : '',
      'Mapped By': issue.mapped_by || '',
      'Comments Count': issue.comments ? issue.comments.length : 0,
      'Has Attachments': issue.attachments ? 'Yes' : 'No',
      'Attachment URL': issue.attachment_url || ''
    };
  };

  const getFilteredIssues = () => {
    let filteredIssues = [...issues];

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filteredIssues = filteredIssues.filter(issue => {
        const issueDate = new Date(issue.created_at);
        
        if (dateRange.from && issueDate < dateRange.from) {
          return false;
        }
        
        if (dateRange.to && issueDate > dateRange.to) {
          return false;
        }
        
        return true;
      });
    }

    return filteredIssues;
  };

  const exportAllIssues = () => {
    try {
      const filteredIssues = getFilteredIssues();
      const formattedData = filteredIssues.map(formatIssueForExport);
      
      let filename = 'issues-export';
      
      // Add date range to filename if applied
      if (dateRange.from || dateRange.to) {
        const fromStr = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : 'start';
        const toStr = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : 'end';
        filename += `-${fromStr}-to-${toStr}`;
      }
      
      // Add current date
      filename += `-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      
      exportToCSV(formattedData, filename);
      
      toast.success(`Exported ${formattedData.length} issues successfully!`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const exportAnalyticsSummary = () => {
    try {
      if (!analytics) {
        toast.error('No analytics data available');
        return;
      }

      const summaryData = [
        {
          'Metric': 'Total Issues',
          'Value': analytics.totalIssues || 0,
          'Description': 'Total number of issues in the system'
        },
        {
          'Metric': 'Open Issues',
          'Value': analytics.openIssues || 0,
          'Description': 'Number of issues currently open'
        },
        {
          'Metric': 'Resolution Rate',
          'Value': `${analytics.resolutionRate?.toFixed(1) || 0}%`,
          'Description': 'Percentage of issues that have been resolved'
        },
        {
          'Metric': 'Average Resolution Time',
          'Value': `${analytics.avgResolutionTime || 0} hours`,
          'Description': 'Average time taken to resolve issues'
        },
        {
          'Metric': 'Average First Response Time',
          'Value': `${analytics.avgFirstResponseTime || 0} hours`,
          'Description': 'Average time taken for first response to issues'
        }
      ];

      // Add type counts
      if (analytics.typeCounts) {
        Object.entries(analytics.typeCounts).forEach(([type, count]: [string, any]) => {
          summaryData.push({
            'Metric': `Issues by Type - ${type}`,
            'Value': count,
            'Description': `Number of issues of type ${type}`
          });
        });
      }

      // Add city counts
      if (analytics.cityCounts) {
        Object.entries(analytics.cityCounts).forEach(([city, count]: [string, any]) => {
          summaryData.push({
            'Metric': `Issues by City - ${city}`,
            'Value': count,
            'Description': `Number of issues from ${city}`
          });
        });
      }

      // Add cluster counts
      if (analytics.clusterCounts) {
        Object.entries(analytics.clusterCounts).forEach(([cluster, count]: [string, any]) => {
          summaryData.push({
            'Metric': `Issues by Cluster - ${cluster}`,
            'Value': count,
            'Description': `Number of issues from ${cluster} cluster`
          });
        });
      }

      const filename = `analytics-summary-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      exportToCSV(summaryData, filename);
      
      toast.success('Analytics summary exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics summary');
    }
  };

  const filteredCount = getFilteredIssues().length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          {dateRange.from || dateRange.to ? (
            <p>Filtered data: {filteredCount} issues</p>
          ) : (
            <p>Total data: {issues.length} issues</p>
          )}
        </div>
        
        <Button 
          onClick={exportAllIssues}
          className="w-full"
          variant="default"
        >
          <Download className="mr-2 h-4 w-4" />
          Export All Issues Data
        </Button>
        
        <Button 
          onClick={exportAnalyticsSummary}
          className="w-full"
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Analytics Summary
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExportSection;
