
import { useState } from 'react';
import { ApiService } from '../services/apiService';

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface FileUploadResult {
  success: boolean;
  file?: {
    filename: string;
    originalName: string;
    size: number;
    url: string;
  };
  error?: string;
}

export const useFileUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File, category = 'attachments'): Promise<FileUploadResult> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      // Validate file type
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls/;
      const isValidType = allowedTypes.test(file.name.toLowerCase()) || 
                         allowedTypes.test(file.type.toLowerCase());
      
      if (!isValidType) {
        throw new Error('Invalid file type. Only images, PDFs, and documents are allowed.');
      }

      const result = await ApiService.uploadFile(file, category);
      
      setUploadProgress({ loaded: file.size, total: file.size, percentage: 100 });
      
      return {
        success: true,
        file: result.file
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Upload failed';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setIsUploading(false);
      setTimeout(() => {
        setUploadProgress(null);
        setError(null);
      }, 3000);
    }
  };

  const uploadMultipleFiles = async (files: File[], category = 'attachments') => {
    const results = await Promise.all(
      files.map(file => uploadFile(file, category))
    );
    return results;
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    isUploading,
    uploadProgress,
    error
  };
};
