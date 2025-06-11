
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Download, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface DashboardUser {
  name: string;
  email: string;
  role: string;
  permissions: string[];
}

interface ValidationResult {
  valid: DashboardUser[];
  invalid: Array<{
    row: number;
    data: any;
    errors: string[];
  }>;
}

const DashboardUserBulkUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [preview, setPreview] = useState<any[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
      parsePreview(selectedFile);
    }
  };

  const parsePreview = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const previewData = lines.slice(1, 6).map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row: any = { _rowNumber: index + 2 };
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        return row;
      });
      
      setPreview(previewData);
    } catch (error) {
      console.error('Failed to parse preview:', error);
    }
  };

  const downloadTemplate = () => {
    const csvContent = [
      'name,email,role,permissions',
      'John Admin,john.admin@company.com,admin,"user_management,analytics,settings"',
      'Jane Manager,jane.manager@company.com,manager,"analytics,reports"',
      'Bob Analyst,bob.analyst@company.com,analyst,"analytics"'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard_users_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const validateFile = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await ApiClient.post('/api/dashboard-users/validate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setValidationResult(response.data);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpload = async () => {
    if (!validationResult?.valid.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const response = await ApiClient.post('/api/dashboard-users/bulk-create', {
        users: validationResult.valid
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset form after successful upload
      setTimeout(() => {
        setFile(null);
        setValidationResult(null);
        setPreview([]);
        setUploadProgress(0);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Dashboard Users Bulk Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h3 className="font-medium">Download Template</h3>
              <p className="text-sm text-gray-600">
                Get the CSV template for dashboard users with roles and permissions
              </p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-2 block">Upload CSV File</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="dashboard-file-upload"
              />
              <label htmlFor="dashboard-file-upload" className="cursor-pointer">
                {file ? (
                  <div className="space-y-2">
                    <FileText className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-600">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="text-gray-600">Click to select CSV file</p>
                    <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Preview (First 5 rows)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).filter(key => key !== '_rowNumber').map(header => (
                        <th key={header} className="px-3 py-2 text-left border-b">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, index) => (
                      <tr key={index} className="border-b">
                        {Object.entries(row).filter(([key]) => key !== '_rowNumber').map(([key, value]) => (
                          <td key={key} className="px-3 py-2">
                            {String(value)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Validation Button */}
          {file && !validationResult && (
            <Button 
              onClick={validateFile}
              disabled={isValidating}
              className="w-full"
            >
              {isValidating ? 'Validating...' : 'Validate File'}
            </Button>
          )}

          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Validation Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {validationResult.valid.length}
                    </div>
                    <div className="text-sm text-gray-600">Valid Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {validationResult.invalid.length}
                    </div>
                    <div className="text-sm text-gray-600">Invalid Users</div>
                  </div>
                </div>

                {/* Valid Users */}
                {validationResult.valid.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Valid Users ({validationResult.valid.length})</h4>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {validationResult.valid.map((user, index) => (
                        <div key={index} className="text-sm p-2 bg-green-50 rounded flex justify-between">
                          <span>{user.name} ({user.email})</span>
                          <Badge variant="secondary">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Invalid Users */}
                {validationResult.invalid.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Invalid Users ({validationResult.invalid.length})</h4>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                      {validationResult.invalid.map((invalid, index) => (
                        <div key={index} className="text-sm p-2 bg-red-50 border border-red-200 rounded">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium">Row {invalid.row}</span>
                            <Badge variant="destructive">Invalid</Badge>
                          </div>
                          <div className="text-red-600 text-xs">
                            {invalid.errors.join(', ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading {validationResult?.valid.length} users...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          {validationResult && validationResult.valid.length > 0 && (
            <Button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? 'Uploading...' : `Upload ${validationResult.valid.length} Valid Users`}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardUserBulkUpload;
