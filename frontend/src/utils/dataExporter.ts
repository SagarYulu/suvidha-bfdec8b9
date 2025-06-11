
interface ExportColumn {
  key: string;
  label: string;
  format?: (value: any) => string;
}

interface ExportOptions {
  filename: string;
  format: 'csv' | 'excel' | 'json';
  columns: ExportColumn[];
  data: Array<Record<string, any>>;
}

export class DataExporter {
  static exportData(options: ExportOptions): void {
    switch (options.format) {
      case 'csv':
        this.exportCSV(options);
        break;
      case 'excel':
        this.exportExcel(options);
        break;
      case 'json':
        this.exportJSON(options);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static exportCSV(options: ExportOptions): void {
    const headers = options.columns.map(col => col.label);
    const rows = options.data.map(row => 
      options.columns.map(col => {
        const value = row[col.key];
        const formattedValue = col.format ? col.format(value) : value;
        return this.escapeCSVValue(formattedValue);
      })
    );

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${options.filename}.csv`, 'text/csv');
  }

  private static exportExcel(options: ExportOptions): void {
    // For a full Excel export, you'd typically use a library like xlsx
    // For now, we'll export as CSV with .xlsx extension
    this.exportCSV({ ...options, filename: `${options.filename}.xlsx` });
  }

  private static exportJSON(options: ExportOptions): void {
    const exportData = options.data.map(row => {
      const exportRow: Record<string, any> = {};
      options.columns.forEach(col => {
        const value = row[col.key];
        exportRow[col.label] = col.format ? col.format(value) : value;
      });
      return exportRow;
    });

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, `${options.filename}.json`, 'application/json');
  }

  private static escapeCSVValue(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }
    
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    
    return stringValue;
  }

  private static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Predefined column configurations
export const issueExportColumns: ExportColumn[] = [
  { key: 'id', label: 'Issue ID' },
  { key: 'title', label: 'Title' },
  { key: 'description', label: 'Description' },
  { key: 'status', label: 'Status', format: (value) => value.replace('_', ' ').toUpperCase() },
  { key: 'priority', label: 'Priority', format: (value) => value.toUpperCase() },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'createdAt', label: 'Created Date', format: (value) => new Date(value).toLocaleDateString() },
  { key: 'updatedAt', label: 'Last Updated', format: (value) => new Date(value).toLocaleDateString() }
];

export const userExportColumns: ExportColumn[] = [
  { key: 'employeeId', label: 'Employee ID' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'city', label: 'City' },
  { key: 'cluster', label: 'Cluster' },
  { key: 'role', label: 'Role' },
  { key: 'manager', label: 'Manager' },
  { key: 'createdAt', label: 'Created Date', format: (value) => new Date(value).toLocaleDateString() }
];

export const feedbackExportColumns: ExportColumn[] = [
  { key: 'id', label: 'Feedback ID' },
  { key: 'issueId', label: 'Issue ID' },
  { key: 'rating', label: 'Rating' },
  { key: 'sentiment', label: 'Sentiment' },
  { key: 'content', label: 'Feedback Content' },
  { key: 'employeeName', label: 'Employee Name' },
  { key: 'createdAt', label: 'Submitted Date', format: (value) => new Date(value).toLocaleDateString() }
];
