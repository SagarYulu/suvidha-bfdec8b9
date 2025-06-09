
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
}

interface CloudFileUploadProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  multiple?: boolean;
  disabled?: boolean;
}

const CloudFileUpload: React.FC<CloudFileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  multiple = true,
  disabled = false
}) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
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
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: File[] = Array.from(selectedFiles);
    
    // Check max files limit
    if (files.length + newFiles.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        variant: 'destructive'
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: 'Invalid file',
          description: `${file.name}: ${error}`,
          variant: 'destructive'
        });
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      uploadFiles(validFiles);
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    setUploading(true);

    // Create initial file objects
    const newFiles: UploadedFile[] = filesToUpload.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      url: '',
      status: 'uploading',
      progress: 0
    }));

    setFiles(prev => [...prev, ...newFiles]);

    try {
      // Upload files one by one or in parallel
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', 'attachments');

        try {
          // Simulate upload progress
          const fileId = newFiles[index].id;
          
          // Update progress periodically
          const progressInterval = setInterval(() => {
            setFiles(prev => prev.map(f => 
              f.id === fileId && f.status === 'uploading'
                ? { ...f, progress: Math.min((f.progress || 0) + 10, 90) }
                : f
            ));
          }, 200);

          // Make actual upload request
          const response = await fetch('/api/files/upload', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
          });

          clearInterval(progressInterval);

          if (!response.ok) {
            throw new Error('Upload failed');
          }

          const result = await response.json();
          
          // Update file status to success
          setFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { 
                  ...f, 
                  status: 'success', 
                  progress: 100, 
                  url: result.data.url 
                }
              : f
          ));

          return {
            ...newFiles[index],
            status: 'success' as const,
            url: result.data.url
          };
        } catch (error) {
          // Update file status to error
          setFiles(prev => prev.map(f => 
            f.id === newFiles[index].id 
              ? { ...f, status: 'error', progress: 0 }
              : f
          ));
          
          toast({
            title: 'Upload failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive'
          });

          return null;
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean) as UploadedFile[];
      
      if (successfulUploads.length > 0) {
        onFilesUploaded(successfulUploads);
        toast({
          title: 'Upload successful',
          description: `${successfulUploads.length} file(s) uploaded successfully`
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload error',
        description: 'An error occurred during upload',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const triggerFileSelect = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full space-y-4">
      {/* Upload Area */}
      <Card 
        className={`
          border-2 border-dashed transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileSelect}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <div className="text-center">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Support for {acceptedTypes.join(', ')}
            </p>
            <p className="text-xs text-gray-400">
              Max {maxFiles} files, {maxFileSize}MB each
            </p>
          </div>
          
          {!disabled && (
            <Button variant="outline" className="mt-4" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Select Files'}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Uploaded Files ({files.length})
          </h4>
          
          {files.map((file) => (
            <Card key={file.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <File className="h-5 w-5 text-gray-400" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {file.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress || 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Icon */}
                  {file.status === 'success' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  {file.status === 'uploading' && (
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  )}

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CloudFileUpload;
