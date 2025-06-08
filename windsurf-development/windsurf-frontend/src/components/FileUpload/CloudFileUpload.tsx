
import React, { useCallback, useState } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle, Eye } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';

interface CloudFileUploadProps {
  onFilesUploaded: (files: any[]) => void;
  maxFiles?: number;
  category?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  showPreviews?: boolean;
  cloudStorage?: boolean;
}

export const CloudFileUpload: React.FC<CloudFileUploadProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  category = 'attachments',
  accept = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xlsx,.xls',
  multiple = true,
  disabled = false,
  showPreviews = true,
  cloudStorage = false
}) => {
  const { uploadFile, uploadMultipleFiles, isUploading, uploadProgress, error } = useFileUpload();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [isDragOver, setIsDragOver] = useState(false);

  const generatePreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(''); // No preview for non-images
      }
    });
  }, []);

  const validateFile = (file: File): string | null => {
    // File size validation (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB';
    }

    // File type validation
    const allowedTypes = /\.(jpeg|jpg|png|gif|pdf|doc|docx|txt|xlsx|xls)$/i;
    if (!allowedTypes.test(file.name)) {
      return 'Invalid file type. Only images, PDFs, and documents are allowed.';
    }

    return null;
  };

  const handleFileSelect = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate files
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
      console.error('File validation errors:', validationErrors);
      return;
    }

    if (validFiles.length > maxFiles) {
      console.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Generate previews for valid files
    if (showPreviews) {
      const newPreviews: { [key: string]: string } = {};
      for (const file of validFiles) {
        const preview = await generatePreview(file);
        if (preview) {
          newPreviews[file.name] = preview;
        }
      }
      setPreviews(prev => ({ ...prev, ...newPreviews }));
    }

    try {
      let results;
      if (multiple && validFiles.length > 1) {
        results = await uploadMultipleFiles(validFiles, category);
      } else {
        const result = await uploadFile(validFiles[0], category);
        results = [result];
      }

      const successfulUploads = results
        .filter(result => result.success)
        .map(result => ({
          ...result.file,
          uploadedAt: new Date().toISOString(),
          category,
          cloudStorage
        }));

      if (successfulUploads.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulUploads]);
        onFilesUploaded(successfulUploads);
      }

      // Handle failed uploads
      const failedUploads = results.filter(result => !result.success);
      if (failedUploads.length > 0) {
        console.error('Some uploads failed:', failedUploads);
      }

    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

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

  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[filename];
      return newPreviews;
    });
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const openFilePreview = (file: any) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 cursor-pointer'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => {
          if (!disabled) {
            const input = document.createElement('input');
            input.type = 'file';
            input.multiple = multiple;
            input.accept = accept;
            input.onchange = (e) => {
              const files = Array.from((e.target as HTMLInputElement).files || []);
              handleFileSelect(files);
            };
            input.click();
          }
        }}
      >
        <Upload className={`w-8 h-8 mx-auto mb-2 ${
          disabled ? 'text-gray-400' : isDragOver ? 'text-blue-500' : 'text-gray-500'
        }`} />
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {disabled 
            ? 'Upload disabled' 
            : isDragOver
            ? 'Drop files here'
            : 'Click to upload files or drag and drop'
          }
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, 10MB each
          {cloudStorage && <span className="block">Files will be stored in cloud storage</span>}
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadProgress.percentage}%</span>
          </div>
          <Progress value={uploadProgress.percentage} className="h-2" />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploaded Files</h4>
          {uploadedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3"
            >
              <div className="flex items-center flex-1">
                {previews[file.originalName] ? (
                  <img 
                    src={previews[file.originalName]} 
                    alt={file.originalName}
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                ) : (
                  getFileIcon(file.filename)
                )}
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                    {cloudStorage && <span className="ml-2">☁️ Cloud Storage</span>}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {showPreviews && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openFilePreview(file)}
                      className="p-1"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file.filename)}
                className="text-red-500 hover:text-red-700 p-1 ml-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
