
import { ApiService } from './api';
import { saveAs } from 'file-saver';
import * as papa from 'papaparse';

export interface ExportFilters {
  dateRange?: {
    from?: string;
    to?: string;
  };
  status?: string;
  priority?: string;
  category?: string;
  department?: string;
  rating?: number;
  satisfaction?: string;
}

export class ExportService {
  private static async downloadCSV(data: any[], filename: string) {
    try {
      const csv = papa.unparse(data, {
        header: true,
        delimiter: ',',
        quotes: true
      });
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, filename);
      
      return { success: true, count: data.length };
    } catch (error) {
      console.error('Error creating CSV:', error);
      throw new Error('Failed to create CSV file');
    }
  }

  static async exportIssues(filters: ExportFilters = {}) {
    try {
      const response = await ApiService.post('/export/issues', { 
        filters,
        dateRange: filters.dateRange 
      });
      
      if (response.success && response.data) {
        await this.downloadCSV(response.data, response.filename);
        return { success: true, count: response.count };
      }
      
      throw new Error('No data received from server');
    } catch (error) {
      console.error('Error exporting issues:', error);
      throw error;
    }
  }

  static async exportAnalytics(filters: ExportFilters = {}) {
    try {
      const response = await ApiService.post('/export/analytics', { filters });
      
      if (response.success && response.data) {
        await this.downloadCSV(response.data, response.filename);
        return { success: true, count: response.count };
      }
      
      throw new Error('No data received from server');
    } catch (error) {
      console.error('Error exporting analytics:', error);
      throw error;
    }
  }

  static async exportFeedback(filters: ExportFilters = {}) {
    try {
      const response = await ApiService.post('/export/feedback', { filters });
      
      if (response.success && response.data) {
        await this.downloadCSV(response.data, response.filename);
        return { success: true, count: response.count };
      }
      
      throw new Error('No data received from server');
    } catch (error) {
      console.error('Error exporting feedback:', error);
      throw error;
    }
  }

  static async exportComprehensive() {
    try {
      const response = await ApiService.post('/export/comprehensive', {});
      
      if (response.success && response.data) {
        await this.downloadCSV(response.data, response.filename);
        return { success: true, count: response.count };
      }
      
      throw new Error('No data received from server');
    } catch (error) {
      console.error('Error exporting comprehensive data:', error);
      throw error;
    }
  }
}
