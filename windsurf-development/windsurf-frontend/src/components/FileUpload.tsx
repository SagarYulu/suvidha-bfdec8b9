
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apiService } from '@/services/api';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface FileUploadProps {
  endpoint: string;
  accept?: Record<string, string[]>;
  maxSize?: number;
  multiple?: boolean;
  onUploadSuccess?: (response: any) => void;
  onUploadError?: (error: any) => void;
  additionalData?: Record<string, any>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  endpoint,
  accept = { 'image/*': [], 'application/pdf': [] },
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  onUploadSuccess,
  onUploadError,
  additionalData
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { handleError, handleSuccess } = useErrorHandler();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        
        const response = await apiService.uploadFile(endpoint, file, additionalData);
        
        if (onUploadSuccess) {
          onUploadSuccess(response);
        }
        
        setUploadedFiles(prev => [...prev, file]);
        setUploadProgress(((i + 1) / acceptedFiles.length) * 100);
      }
      
      handleSuccess(`Successfully uploaded ${acceptedFiles.length} file(s)`);
    } catch (error) {
      handleError(error, 'File upload failed');
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [endpoint, additionalData, onUploadSuccess, onUploadError, handleError, handleSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
    disabled: uploading
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              Max file size: {(maxSize / (1024 * 1024)).toFixed(1)}MB
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center space-x-2">
                <File className="h-4 w-4 text-gray-500" />
                <span className="text-sm">{file.name}</span>
                <span className="text-xs text-gray-400">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
