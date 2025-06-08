
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, AlertCircle, CheckCircle, Eye, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFilesUploaded?: (files: { url: string; name: string; type: string; id: string }[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  category?: string;
  issueId?: string;
  className?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  url?: string;
  id?: string;
  error?: string;
}

export const CloudFileUpload: React.FC<FileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10, // 10MB default
  acceptedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt'],
  category = 'attachments',
  issueId,
  className = ''
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<'s3' | 'local' | 'unknown'>('unknown');

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const mimeType = file.type;
    
    // Security: Block dangerous file types
    const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.com', '.js', '.jar'];
    if (dangerousExtensions.includes(fileExtension)) {
      return `File type not allowed for security reasons: ${fileExtension}`;
    }
    
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
  };

  const uploadFile = async (file: File): Promise<{ url: string; name: string; type: string; id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    if (issueId) {
      formData.append('issueId', issueId);
    }

    const response = await fetch('/api/files/upload/single', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Detect storage type
    if (result.file.storageType) {
      setStorageStatus(result.file.storageType);
    }
    
    return {
      url: result.file.url,
      name: file.name,
      type: file.type,
      id: result.file.id
    };
  };

  const checkStorageHealth = async () => {
    try {
      const response = await fetch('/api/files/system/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.storage?.s3?.status === 'connected') {
          setStorageStatus('s3');
        } else {
          setStorageStatus('local');
        }
      }
    } catch (error) {
      console.warn('Storage health check failed:', error);
      setStorageStatus('local');
    }
  };

  const handleFilesAdded = useCallback(async (acceptedFiles: File[]) => {
    setUploadError(null);
    
    // Check storage health on first upload
    if (storageStatus === 'unknown') {
      await checkStorageHealth();
    }

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of acceptedFiles) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
      return;
    }

    // Check total file limit
    if (uploadingFiles.length + validFiles.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Initialize uploading state
    const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Upload files
    const uploadPromises = validFiles.map(async (file, index) => {
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => 
            prev.map(uf => 
              uf.file === file 
                ? { ...uf, progress: Math.min(uf.progress + 10, 90) }
                : uf
            )
          );
        }, 200);

        const result = await uploadFile(file);
        
        clearInterval(progressInterval);
        
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, progress: 100, status: 'success', url: result.url, id: result.id }
              : uf
          )
        );

        return result;
      } catch (error) {
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { 
                  ...uf, 
                  status: 'error', 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : uf
          )
        );
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result !== null);
    
    if (successfulUploads.length > 0 && onFilesUploaded) {
      onFilesUploaded(successfulUploads);
    }
  }, [uploadingFiles.length, maxFiles, category, issueId, onFilesUploaded, storageStatus]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFilesAdded,
    maxFiles,
    maxSize: maxFileSize * 1024 * 1024,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>)
  });

  const removeFile = (fileToRemove: UploadingFile) => {
    setUploadingFiles(prev => prev.filter(uf => uf !== fileToRemove));
  };

  const clearAllFiles = () => {
    setUploadingFiles([]);
    setUploadError(null);
  };

  const openFilePreview = (file: UploadingFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  const getStorageIcon = () => {
    switch (storageStatus) {
      case 's3':
        return '☁️';
      case 'local':
        return '💾';
      default:
        return '📁';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isDragActive ? 'Drop files here' : 'Choose files or drag and drop'}
        </p>
        <p className="text-sm text-muted-foreground">
          Supports: {acceptedFileTypes.join(', ')} (max {maxFileSize}MB each)
        </p>
        {storageStatus !== 'unknown' && (
          <p className="text-xs text-muted-foreground mt-2">
            {getStorageIcon()} Storage: {storageStatus === 's3' ? 'Cloud (S3)' : 'Local'}
          </p>
        )}
      </div>

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">
              Uploading Files ({uploadingFiles.length}/{maxFiles})
            </h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearAllFiles}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>

          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <File className="h-4 w-4" />
                  <span className="text-sm font-medium truncate">
                    {uploadingFile.file.name}
                  </span>
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  {storageStatus === 's3' && uploadingFile.status === 'success' && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ☁️ Cloud
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'success' && uploadingFile.url && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openFilePreview(uploadingFile)}
                        className="p-1"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(uploadingFile.url, '_blank')}
                        className="p-1"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadingFile)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {uploadingFile.status === 'uploading' && (
                <Progress value={uploadingFile.progress} className="h-2" />
              )}

              {uploadingFile.status === 'error' && (
                <p className="text-sm text-red-600">{uploadingFile.error}</p>
              )}

              {uploadingFile.status === 'success' && (
                <p className="text-sm text-green-600">
                  Upload completed {storageStatus === 's3' ? 'to cloud storage' : 'locally'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudFileUpload;
