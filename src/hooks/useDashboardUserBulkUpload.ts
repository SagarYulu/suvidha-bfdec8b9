
import { useState } from 'react';
import { api } from '../lib/api';

export const useDashboardUserBulkUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<any>(null);

  const uploadDashboardUsers = async (file: File) => {
    setIsUploading(true);
    setUploadResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/dashboard-users/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setUploadResults(response.data);
      return response.data;
    } catch (error) {
      console.error('Dashboard user bulk upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadDashboardUsers,
    isUploading,
    uploadResults
  };
};
