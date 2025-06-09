
import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id?: string;
  name: string;
  size: number;
  url: string;
  key?: string;
  mimetype?: string;
}

interface UseFileUploadOptions {
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  maxFiles?: number;
  category?: string;
}

interface UseFileUploadReturn {
  uploadedFiles: UploadedFile[];
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  uploadSingle: (file: File) => Promise<UploadedFile | null>;
  uploadMultiple: (files: File[]) => Promise<UploadedFile[]>;
  deleteFile: (fileKey: string) => Promise<boolean>;
  getSignedUrl: (fileKey: string, expires?: number) => Promise<string | null>;
  clearFiles: () => void;
  removeUploadedFile: (index: number) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}): UseFileUploadReturn => {
  const {
    maxFileSize = 10, // 10MB
    acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
    maxFiles = 5,
    category = 'attachments'
  } = options;

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type.match(type.replace('*', '.*'));
    });

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  }, [maxFileSize, acceptedTypes]);

  const uploadSingle = useCallback(async (file: File): Promise<UploadedFile | null> => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: 'Invalid file',
        description: validationError,
        variant: 'destructive'
      });
      return null;
    }

    // Check max files limit
    if (uploadedFiles.length >= maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return null;
    }

    setIsUploading(true);
    const fileId = Math.random().toString(36).substr(2, 9);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: Math.min((prev[fileId] || 0) + 10, 90)
        }));
      }, 200);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      
      const uploadedFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        url: data.data.url,
        key: data.data.key || data.data.path,
        mimetype: file.type
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);
      setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));

      toast({
        title: 'Upload successful',
        description: `${file.name} uploaded successfully`
      });

      return uploadedFile;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || `Failed to upload ${file.name}`,
        variant: 'destructive'
      });
      
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, uploadedFiles.length, maxFiles, category]);

  const uploadMultiple = useCallback(async (files: File[]): Promise<UploadedFile[]> => {
    const uploadPromises = files.map(file => uploadSingle(file));
    const results = await Promise.all(uploadPromises);
    return results.filter(Boolean) as UploadedFile[];
  }, [uploadSingle]);

  const deleteFile = useCallback(async (fileKey: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/files/${fileKey}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setUploadedFiles(prev => prev.filter(file => file.key !== fileKey));
        
        toast({
          title: 'File deleted',
          description: 'File has been deleted successfully'
        });
        
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete file');
      }
    } catch (error: any) {
      console.error('Delete file error:', error);
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete file',
        variant: 'destructive'
      });
      return false;
    }
  }, []);

  const getSignedUrl = useCallback(async (fileKey: string, expires = 3600): Promise<string | null> => {
    try {
      const response = await fetch(`/api/files/signed-url/${fileKey}?expires=${expires}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.url;
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to get signed URL');
      }
    } catch (error: any) {
      console.error('Get signed URL error:', error);
      toast({
        title: 'Access failed',
        description: error.message || 'Failed to access file',
        variant: 'destructive'
      });
      return null;
    }
  }, []);

  const clearFiles = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress({});
  }, []);

  const removeUploadedFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  return {
    uploadedFiles,
    isUploading,
    uploadProgress,
    uploadSingle,
    uploadMultiple,
    deleteFile,
    getSignedUrl,
    clearFiles,
    removeUploadedFile
  };
};

// Specialized hook for issue attachments
export const useIssueAttachments = (issueId?: string) => {
  const fileUpload = useFileUpload({
    category: 'issue_attachments',
    maxFiles: 5,
    maxFileSize: 10
  });

  const attachFilesToIssue = useCallback(async (files: UploadedFile[]): Promise<boolean> => {
    if (!issueId) return false;

    try {
      const response = await fetch(`/api/issues/${issueId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          attachments: files.map(file => ({
            url: file.url,
            name: file.name,
            size: file.size,
            key: file.key
          }))
        })
      });

      if (response.ok) {
        toast({
          title: 'Attachments added',
          description: `${files.length} file(s) attached to issue`
        });
        return true;
      } else {
        throw new Error('Failed to attach files to issue');
      }
    } catch (error: any) {
      console.error('Attach files error:', error);
      toast({
        title: 'Attachment failed',
        description: 'Failed to attach files to issue',
        variant: 'destructive'
      });
      return false;
    }
  }, [issueId]);

  return {
    ...fileUpload,
    attachFilesToIssue
  };
};
