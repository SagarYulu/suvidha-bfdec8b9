
import React, { useState, useCallback } from 'react';
import { Upload, X, File, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFileUpload: (files: File[]) => Promise<void>;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

export const CloudFileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxFiles = 5,
  maxFileSize = 10 * 1024 * 1024,
  acceptedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx'],
  multiple = true,
  disabled = false
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${formatFileSize(maxFileSize)}.`;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedFileTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not allowed. Accepted types: ${acceptedFileTypes.join(', ')}.`;
    }

    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = useCallback(async (selectedFiles: FileList) => {
    setError(null);
    const fileArray = Array.from(selectedFiles);

    if (files.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed. You can upload ${maxFiles - files.length} more files.`);
      return;
    }

    const validationErrors: string[] = [];
    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        validationErrors.push(error);
      }
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(' '));
      return;
    }

    const newFiles: UploadedFile[] = fileArray.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setIsUploading(true);

    try {
      await onFileUpload(fileArray);
      setFiles(prev => 
        prev.map(f => 
          newFiles.some(nf => nf.file === f.file) 
            ? { ...f, status: 'completed' as const, progress: 100 }
            : f
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setFiles(prev => 
        prev.map(f => 
          newFiles.some(nf => nf.file === f.file) 
            ? { ...f, status: 'error' as const, error: errorMessage }
            : f
        )
      );
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  }, [files.length, maxFiles, onFileUpload]);

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

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [disabled, handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    e.target.value = '';
  }, [handleFiles]);

  const removeFile = useCallback((index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) {
      setError(null);
    }
  }, [files.length]);

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple={multiple}
          accept={acceptedFileTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p className="text-xs text-gray-500">
          {acceptedFileTypes.join(', ')} up to {formatFileSize(maxFileSize)} each
        </p>
        <p className="text-xs text-gray-500">
          Maximum {maxFiles} files
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Uploaded Files ({files.length}/{maxFiles})
          </h4>
          
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <File className="h-4 w-4 text-gray-500 flex-shrink-0" />
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {uploadedFile.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(uploadedFile.file.size)}
                </p>
                
                {uploadedFile.status === 'uploading' && (
                  <Progress value={uploadedFile.progress} className="mt-1" />
                )}
                
                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <p className="text-xs text-red-600 mt-1">{uploadedFile.error}</p>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {getStatusIcon(uploadedFile.status)}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
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
