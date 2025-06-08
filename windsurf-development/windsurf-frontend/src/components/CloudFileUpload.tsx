
import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

interface CloudFileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export const CloudFileUpload: React.FC<CloudFileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', '.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'],
  disabled = false,
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`;
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
  };

  const uploadToS3 = async (file: File): Promise<{ success: boolean; url?: string; error?: string }> => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', 'attachments');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, url: result.data.url };
      } else {
        return { success: false, error: result.error || 'Upload failed' };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'Network error during upload' };
    }
  };

  const handleFiles = async (files: FileList) => {
    setError(null);

    // Check if we're exceeding max files
    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - uploadedFiles.length} more files.`);
      return;
    }

    const newFiles: UploadedFile[] = [];
    const validationErrors: string[] = [];

    // Validate all files first
    Array.from(files).forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        validationErrors.push(validationError);
      } else {
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 0,
          status: 'uploading'
        });
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    // Add files to state immediately
    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Upload files one by one
    for (let i = 0; i < newFiles.length; i++) {
      const file = files[i];
      const fileState = newFiles[i];

      try {
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileState.id 
                ? { ...f, uploadProgress: Math.min(f.uploadProgress + 10, 90) }
                : f
            )
          );
        }, 200);

        const result = await uploadToS3(file);

        clearInterval(progressInterval);

        if (result.success) {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileState.id 
                ? { 
                    ...f, 
                    uploadProgress: 100, 
                    status: 'completed', 
                    url: result.url 
                  }
                : f
            )
          );
        } else {
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === fileState.id 
                ? { 
                    ...f, 
                    status: 'error', 
                    error: result.error 
                  }
                : f
            )
          );
        }
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === fileState.id 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: 'Upload failed' 
                }
              : f
          )
        );
      }
    }

    // Notify parent component of successful uploads
    const successfulFiles = uploadedFiles.filter(f => f.status === 'completed');
    if (successfulFiles.length > 0) {
      onFilesUploaded(successfulFiles);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, uploadedFiles.length]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [uploadedFiles.length]);

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setError(null);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-500" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const openFilePreview = (file: UploadedFile) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${disabled 
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed' 
            : isDragOver
            ? 'border-blue-400 bg-blue-50 scale-105'
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${
          disabled ? 'text-gray-400' : isDragOver ? 'text-blue-500' : 'text-gray-500'
        }`} />
        
        <p className={`text-lg font-medium mb-1 ${
          disabled ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {disabled 
            ? 'Upload disabled' 
            : isDragOver
            ? 'Drop files here'
            : 'Click to upload or drag and drop'
          }
        </p>
        
        <p className="text-sm text-gray-500 mb-2">
          {acceptedTypes.join(', ')} up to {formatFileSize(maxFileSize)}
        </p>
        
        <p className="text-xs text-gray-400">
          Maximum {maxFiles} files • {uploadedFiles.length}/{maxFiles} uploaded
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Files ({uploadedFiles.length})
          </h4>
          
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                file.status === 'completed' 
                  ? 'bg-green-50 border-green-200' 
                  : file.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-center flex-1 min-w-0">
                {getFileIcon(file.type)}
                
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {file.status === 'uploading' && (
                    <Progress value={file.uploadProgress} className="mt-2 h-1" />
                  )}
                  
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {getStatusIcon(file.status)}
                
                {file.status === 'completed' && file.url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openFilePreview(file)}
                    className="p-1 h-8 w-8"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="p-1 h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudFileUpload;
