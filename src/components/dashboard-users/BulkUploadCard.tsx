
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface BulkUploadCardProps {
  onUploadSuccess: () => void;
}

const BulkUploadCard: React.FC<BulkUploadCardProps> = ({ onUploadSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid File",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Upload Successful",
        description: `Successfully processed ${selectedFile.name}`,
      });
      
      setSelectedFile(null);
      onUploadSuccess();
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "There was an error processing the file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "name,email,employeeId,role,department\nJohn Doe,john@example.com,EMP001,employee,IT\nJane Smith,jane@example.com,EMP002,manager,HR";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dashboard-users-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Bulk Upload Dashboard Users</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Upload multiple dashboard users at once using a CSV file.
        </div>
        
        <Button
          variant="outline"
          onClick={downloadTemplate}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          Download CSV Template
        </Button>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="cursor-pointer">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              {selectedFile ? selectedFile.name : "Click to select CSV file"}
            </p>
            <Button variant="outline" type="button">
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </Button>
          </label>
        </div>
        
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="w-full"
        >
          {isUploading ? "Uploading..." : "Upload CSV"}
        </Button>
      </CardContent>
    </>
  );
};

export default BulkUploadCard;
