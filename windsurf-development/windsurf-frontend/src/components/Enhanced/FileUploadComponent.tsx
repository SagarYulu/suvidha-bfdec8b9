
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ApiService } from '@/services/apiService';

interface UploadedFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  url: string;
  status: 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}

interface FileUploadComponentProps {
  onFileUploaded?: (file: UploadedFile) => void;
  onFilesUploaded?: (files: UploadedFile[]) => void;
  onFileRemoved?: (fileId: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  accept?: string[];
  category?: string;
  className?: string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFileUploaded,
  onFilesUploaded,
  onFileRemoved,
  multiple = false,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  accept = ['image/*', 'application/pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'],
  category = 'attachments',
  className = ''
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);

    try {
      if (multiple) {
        // Upload multiple files
        const response = await ApiService.uploadMultipleFiles(acceptedFiles, category);
        
        if (response.success) {
          const newFiles: UploadedFile[] = response.files.map((file: any) => ({
            id: file.filename,
            filename: file.filename,
            originalName: file.originalName,
            size: file.size,
            url: file.url,
            status: 'success'
          }));

          setUploadedFiles(prev => [...prev, ...newFiles]);
          
          if (onFilesUploaded) {
            onFilesUploaded(newFiles);
          }
        }
      } else {
        // Upload single file
        const file = acceptedFiles[0];
        const tempFile: UploadedFile = {
          id: `temp-${Date.now()}`,
          filename: '',
          originalName: file.name,
          size: file.size,
          url: '',
          status: 'uploading',
          progress: 0
        };

        setUploadedFiles(prev => [...prev, tempFile]);

        const response = await ApiService.uploadFile(file, category);
        
        if (response.success) {
          const uploadedFile: UploadedFile = {
            id: response.file.filename,
            filename: response.file.filename,
            originalName: response.file.originalName,
            size: response.file.size,
            url: response.file.url,
            status: 'success'
          };

          setUploadedFiles(prev => 
            prev.map(f => f.id === tempFile.id ? uploadedFile : f)
          );

          if (onFileUploaded) {
            onFileUploaded(uploadedFile);
          }
        } else {
          setUploadedFiles(prev => 
            prev.map(f => f.id === tempFile.id ? { ...f, status: 'error', error: 'Upload failed' } : f)
          );
        }
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      setUploadedFiles(prev => 
        prev.map(f => f.status === 'uploading' ? { ...f, status: 'error', error: error.message } : f)
      );
    } finally {
      setIsUploading(false);
    }
  }, [multiple, category, onFileUploaded, onFilesUploaded]);

  const removeFile = async (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (!file) return;

    try {
      await ApiService.deleteFile(file.filename, category);
      setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
      
      if (onFileRemoved) {
        onFileRemoved(fileId);
      }
    } catch (error) {
      console.error('Error removing file:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: accept.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    maxFiles: multiple ? maxFiles : 1,
    multiple,
    disabled: isUploading
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        {isDragActive ? (
          <p className="text-blue-500">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-2">
              Drag & drop files here, or click to select files
            </p>
            <p className="text-sm text-gray-400">
              Max file size: {formatFileSize(maxSize)}
              {multiple && ` • Max files: ${maxFiles}`}
            </p>
          </div>
        )}
      </div>

      {/* File rejection errors */}
      {fileRejections.length > 0 && (
        <div className="space-y-2">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name} className="flex items-center space-x-2 text-red-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>{file.name}: {errors.map(e => e.message).join(', ')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">
            {uploadedFiles.length === 1 ? 'Uploaded File:' : 'Uploaded Files:'}
          </h4>
          {uploadedFiles.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {file.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {file.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                  {file.status === 'uploading' && <File className="h-5 w-5 text-blue-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {file.originalName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.size)}
                    {file.status === 'error' && file.error && ` • ${file.error}`}
                  </p>
                  {file.status === 'uploading' && file.progress !== undefined && (
                    <Progress value={file.progress} className="h-2 mt-1" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="h-8 w-8 p-0"
                  disabled={file.status === 'uploading'}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload progress */}
      {isUploading && (
        <div className="text-center text-sm text-gray-600">
          Uploading files...
        </div>
      )}
    </div>
  );
};

export default FileUploadComponent;
