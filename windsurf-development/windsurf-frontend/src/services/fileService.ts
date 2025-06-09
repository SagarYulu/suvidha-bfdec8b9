
import { apiClient } from '@/utils/apiClient';
import { API_CONFIG } from '@/config/api';

export class FileService {
  static async uploadFile(file: File, category = 'attachments'): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    return apiClient.uploadFile<any>(API_CONFIG.ENDPOINTS.FILES.UPLOAD, formData);
  }

  static async uploadMultipleFiles(files: File[], category = 'attachments'): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', category);

    return apiClient.uploadFile<any>(`${API_CONFIG.ENDPOINTS.FILES.UPLOAD}/multiple`, formData);
  }

  static async deleteFile(filename: string, category = 'attachments'): Promise<any> {
    return apiClient.delete<any>(`${API_CONFIG.ENDPOINTS.FILES.DELETE}/${category}/${filename}`);
  }
}

export default FileService;
