
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
  data: Array<{ name: string, time: number, volume?: number }>,
  period: string
): Array<{ Period: string, 'Average Resolution Time (hours)': number, 'Ticket Volume': number }> => {
  return data.map(item => ({
    'Period': item.name,
    'Average Resolution Time (hours)': parseFloat(item.time.toFixed(2)),
    'Ticket Volume': item.volume || 0
  }));
};

/**
 * Export resolution time trend data to CSV
 */
export const exportResolutionTimeTrendToCSV = (
  data: Array<{ name: string, time: number, volume?: number }>,
  period: string
): void => {
  const formattedData = formatResolutionTimeDataForExport(data, period);
  const filename = `resolution-time-trend-${period}-${new Date().toISOString().split('T')[0]}.csv`;
  
  exportToCSV(formattedData, filename);
};
