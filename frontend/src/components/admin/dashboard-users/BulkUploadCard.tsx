
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Download, FileText } from 'lucide-react';

interface BulkUploadCardProps {
  onUploadClick: () => void;
  onTemplateDownload: () => void;
}

const BulkUploadCard: React.FC<BulkUploadCardProps> = ({
  onUploadClick,
  onTemplateDownload
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk User Upload
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Upload multiple users at once using a CSV file. Make sure to follow the template format.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button variant="outline" onClick={onTemplateDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          
          <Button onClick={onUploadClick} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Upload CSV
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkUploadCard;
