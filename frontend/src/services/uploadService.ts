
import { ApiClient } from './apiClient';

interface UploadResult {
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  url: string;
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}

export class UploadService {
  static async uploadFiles(files: FileList): Promise<UploadResult[]> {
    const formData = new FormData();
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    const response = await ApiClient.post('/api/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  }

  static async bulkUploadEmployees(file: File): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append('files', file);
    
    const response = await ApiClient.post('/api/upload/bulk/employees', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  }

  static async bulkUploadIssues(file: File): Promise<BulkUploadResult> {
    const formData = new FormData();
    formData.append('files', file);
    
    const response = await ApiClient.post('/api/upload/bulk/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    
    return response.data;
  }

  static async getBulkUploadHistory(): Promise<any[]> {
    const response = await ApiClient.get('/api/upload/bulk/history');
    return response.data;
  }

  static getFileUrl(filename: string): string {
    return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/uploads/files/${filename}`;
  }
}
