
import { useState, useCallback } from 'react';
import { ApiService } from '@/services/apiService';

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  category?: string;
  onProgress?: (progress: UploadProgress[]) => void;
  onComplete?: (files: any[]) => void;
  onError?: (error: string) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxFiles = 5,
    maxFileSize = 10,
    acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
    category = 'attachments',
    onProgress,
    onComplete,
    onError
  } = options;

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes('*')) {
        return mimeType.startsWith(type.replace('*', ''));
      }
      return type === fileExtension || type === mimeType;
    });

    if (!isValidType) {
      return `File type not supported. Allowed types: ${acceptedFileTypes.join(', ')}`;
    }

    return null;
  }, [maxFileSize, acceptedFileTypes]);

  const uploadFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    // Validate all files first
    const validationErrors: string[] = [];
    const validFiles: File[] = [];

    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(', ');
      onError?.(errorMessage);
      return;
    }

    if (validFiles.length > maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    
    // Initialize progress tracking
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    }));
    
    setUploadProgress(initialProgress);
    onProgress?.(initialProgress);

    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        try {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              const updated = prev.map(p => 
                p.fileName === file.name 
                  ? { ...p, progress: Math.min(p.progress + 10, 90) }
                  : p
              );
              onProgress?.(updated);
              return updated;
            });
          }, 200);

          const result = await ApiService.uploadFile(file, category);
          
          clearInterval(progressInterval);
          
          // Update final progress
          setUploadProgress(prev => {
            const updated = prev.map(p => 
              p.fileName === file.name 
                ? { ...p, progress: 100, status: 'success' as const }
                : p
            );
            onProgress?.(updated);
            return updated;
          });

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Upload failed';
          
          setUploadProgress(prev => {
            const updated = prev.map(p => 
              p.fileName === file.name 
                ? { ...p, status: 'error' as const, error: errorMessage }
                : p
            );
            onProgress?.(updated);
            return updated;
          });
          
          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(result => result !== null);
      
      setUploadedFiles(prev => [...prev, ...successfulUploads]);
      onComplete?.(successfulUploads);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      onError?.(errorMessage);
    } finally {
      setUploading(false);
    }
  }, [validateFile, maxFiles, category, onProgress, onComplete, onError]);

  const clearFiles = useCallback(() => {
    setUploadProgress([]);
    setUploadedFiles([]);
  }, []);

  const removeFile = useCallback((fileName: string) => {
    setUploadProgress(prev => prev.filter(p => p.fileName !== fileName));
    setUploadedFiles(prev => prev.filter(f => f.name !== fileName));
  }, []);

  return {
    uploading,
    uploadProgress,
    uploadedFiles,
    uploadFiles,
    clearFiles,
    removeFile,
    validateFile
  };
};

export default useFileUpload;
