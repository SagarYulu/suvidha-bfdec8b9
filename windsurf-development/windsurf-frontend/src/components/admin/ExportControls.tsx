
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { apiService } from "@/services/api";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface ExportControlsProps {
  entityType: 'issues' | 'users';
  filters?: any;
  title?: string;
}

const ExportControls: React.FC<ExportControlsProps> = ({ 
  entityType, 
  filters = {}, 
  title = "Export Data" 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'excel'>('csv');
  const { handleError, handleSuccess } = useErrorHandler();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await apiService.exportData(entityType, selectedFormat, filters);
      handleSuccess(`${entityType} exported successfully as ${selectedFormat.toUpperCase()}`);
    } catch (error) {
      handleError(error, 'Export');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={selectedFormat} onValueChange={(value: 'csv' | 'excel') => setSelectedFormat(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV Format
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Format
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
        
        {Object.keys(filters).length > 0 && (
          <div className="text-sm text-muted-foreground">
            <strong>Applied Filters:</strong> {Object.keys(filters).length} filter(s) active
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExportControls;
