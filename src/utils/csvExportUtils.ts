
import { saveAs } from 'file-saver';
import * as papa from 'papaparse';

/**
 * Convert data to CSV format and trigger download
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.csv',
  options?: papa.UnparseConfig
): void => {
  try {
    // Use PapaParse to convert data to CSV
    const csv = papa.unparse(data, {
      header: true,
      ...options
    });
    
    // Create a blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, filename);
    
    console.log(`Successfully exported data to ${filename}`);
  } catch (error) {
    console.error('Error exporting data to CSV:', error);
    throw new Error('Failed to export data');
  }
};

/**
 * Format resolution time data for CSV export
 */
export const formatResolutionTimeDataForExport = (
  data: Array<{ name: string, time: number, volume?: number, datasetType?: string }>,
  period: string
): Array<Record<string, any>> => {
  // Check if we have comparison data in the dataset
  const hasComparisonData = data.some(item => item.datasetType === 'comparison');
  
  if (!hasComparisonData) {
    // Regular export format
    return data.map(item => ({
      'Period': item.name,
      'Average Resolution Time (hours)': parseFloat(item.time.toFixed(2)),
      'Ticket Volume': item.volume || 0
    }));
  } else {
    // Group by period name for comparison data
    const groupedByName: Record<string, { primary?: any, comparison?: any }> = {};
    
    data.forEach(item => {
      if (!groupedByName[item.name]) {
        groupedByName[item.name] = {};
      }
      
      const type = item.datasetType === 'comparison' ? 'comparison' : 'primary';
      groupedByName[item.name][type] = item;
    });
    
    // Convert to comparison format
    return Object.entries(groupedByName).map(([name, group]) => {
      const primary = group.primary || { time: 0, volume: 0 };
      const comparison = group.comparison || { time: 0, volume: 0 };
      const timeDifference = primary.time - comparison.time;
      
      return {
        'Period': name,
        'Primary Resolution Time (hours)': parseFloat(primary.time.toFixed(2)),
        'Primary Ticket Volume': primary.volume || 0,
        'Comparison Resolution Time (hours)': parseFloat(comparison.time.toFixed(2)),
        'Comparison Ticket Volume': comparison.volume || 0,
        'Resolution Time Difference (hours)': parseFloat(timeDifference.toFixed(2)),
        'Difference (%)': primary.time && comparison.time 
          ? parseFloat((((primary.time - comparison.time) / comparison.time) * 100).toFixed(1)) 
          : 0
      };
    });
  }
};

/**
 * Export resolution time trend data to CSV
 */
export const exportResolutionTimeTrendToCSV = (
  data: Array<{ name: string, time: number, volume?: number, datasetType?: string }>,
  period: string
): void => {
  // Determine if this is a comparison export
  const isComparisonExport = data.some(item => item.datasetType === 'comparison');
  
  const formattedData = formatResolutionTimeDataForExport(data, period);
  let filename = `resolution-time-trend-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Update filename for comparison exports
  if (isComparisonExport) {
    filename = `resolution-time-comparison-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  }
  
  exportToCSV(formattedData, filename);
};

/**
 * Export ticket trend data to CSV
 * @param data Any data for CSV export
 * @param prefix Prefix for the filename
 */
export const exportTicketTrendDataToCSV = (
  data: Array<Record<string, any>>,
  prefix: string
): void => {
  const filename = `${prefix}-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(data, filename);
};

/**
 * Export SLA performance data to CSV
 */
export const exportSLAPerformanceToCSV = (
  data: {
    openInProgress: { total: number, breached: number, withinSLA: number },
    firstResponse: { total: number, breached: number, withinSLA: number },
    closedResolved: { total: number, breached: number, withinSLA: number }
  }
): void => {
  const exportData = [
    {
      'Category': 'Open & In Progress',
      'Total Tickets': data.openInProgress.total,
      'Within SLA': data.openInProgress.withinSLA,
      'SLA Breached': data.openInProgress.breached,
      'Within SLA (%)': data.openInProgress.total > 0 
        ? ((data.openInProgress.withinSLA / data.openInProgress.total) * 100).toFixed(1)
        : '0.0',
      'Breached (%)': data.openInProgress.total > 0 
        ? ((data.openInProgress.breached / data.openInProgress.total) * 100).toFixed(1)
        : '0.0'
    },
    {
      'Category': 'First Response Time',
      'Total Tickets': data.firstResponse.total,
      'Within SLA': data.firstResponse.withinSLA,
      'SLA Breached': data.firstResponse.breached,
      'Within SLA (%)': data.firstResponse.total > 0 
        ? ((data.firstResponse.withinSLA / data.firstResponse.total) * 100).toFixed(1)
        : '0.0',
      'Breached (%)': data.firstResponse.total > 0 
        ? ((data.firstResponse.breached / data.firstResponse.total) * 100).toFixed(1)
        : '0.0'
    },
    {
      'Category': 'Closed & Resolved',
      'Total Tickets': data.closedResolved.total,
      'Within SLA': data.closedResolved.withinSLA,
      'SLA Breached': data.closedResolved.breached,
      'Within SLA (%)': data.closedResolved.total > 0 
        ? ((data.closedResolved.withinSLA / data.closedResolved.total) * 100).toFixed(1)
        : '0.0',
      'Breached (%)': data.closedResolved.total > 0 
        ? ((data.closedResolved.breached / data.closedResolved.total) * 100).toFixed(1)
        : '0.0'
    }
  ];
  
  const filename = `sla-performance-${new Date().toISOString().split('T')[0]}.csv`;
  exportToCSV(exportData, filename);
};
