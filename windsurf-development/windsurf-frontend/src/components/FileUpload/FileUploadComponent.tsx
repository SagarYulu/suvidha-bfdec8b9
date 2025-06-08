
import React, { useRef, useState } from 'react';
import { Upload, X, FileText, Image, AlertCircle, CheckCircle } from 'lucide-react';
import { useFileUpload } from '../../hooks/useFileUpload';

interface FileUploadComponentProps {
  onFilesUploaded: (files: any[]) => void;
  maxFiles?: number;
  category?: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFilesUploaded,
  maxFiles = 5,
  category = 'attachments',
  accept = '.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.xlsx,.xls',
  multiple = true,
  disabled = false
}) => {
  const { uploadFile, uploadMultipleFiles, isUploading, uploadProgress, error } = useFileUpload();
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    if (files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    try {
      let results;
      if (multiple) {
        results = await uploadMultipleFiles(files, category);
      } else {
        const result = await uploadFile(files[0], category);
        results = [result];
      }

      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.file);

      if (successfulUploads.length > 0) {
        setUploadedFiles(prev => [...prev, ...successfulUploads]);
        onFilesUploaded(successfulUploads);
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const removeFile = (filename: string) => {
    setUploadedFiles(prev => prev.filter(file => file.filename !== filename));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-400 cursor-pointer'
        }`}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
        
        <Upload className={`w-8 h-8 mx-auto mb-2 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
        <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
          {disabled ? 'Upload disabled' : 'Click to upload files or drag and drop'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Max {maxFiles} files, 10MB each
        </p>
      </div>

      {/* Upload Progress */}
      {isUploading && uploadProgress && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">Uploading...</span>
            <span className="text-sm text-blue-600">{uploadProgress.percentage}%</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress.percentage}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        </div>
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
              <div className="flex items-center">
                {getFileIcon(file.filename)}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
              </div>
              <button
                onClick={() => removeFile(file.filename)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
