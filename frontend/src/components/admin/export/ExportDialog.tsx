
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileSpreadsheet, FileText, Database } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: 'issues' | 'users' | 'analytics' | 'feedback';
  filters?: any;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  dataType,
  filters = {}
}) => {
  const [format, setFormat] = useState<'csv' | 'excel' | 'pdf'>('csv');
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const fieldOptions = {
    issues: ['id', 'title', 'status', 'priority', 'created_at', 'assigned_to'],
    users: ['id', 'name', 'email', 'role', 'created_at'],
    analytics: ['date', 'issue_count', 'resolution_time', 'satisfaction_score'],
    feedback: ['id', 'content', 'sentiment', 'created_at', 'issue_id']
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await ApiClient.post('/api/export', {
        dataType,
        format,
        includeHeaders,
        fields: selectedFields.length > 0 ? selectedFields : fieldOptions[dataType],
        filters
      });

      // Create download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${dataType}_export_${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={format} onValueChange={(value: 'csv' | 'excel' | 'pdf') => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV File
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel File
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="headers" 
              checked={includeHeaders}
              onCheckedChange={setIncludeHeaders}
            />
            <label htmlFor="headers" className="text-sm font-medium">Include Headers</label>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Fields to Export</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {fieldOptions[dataType].map((field) => (
                <div key={field} className="flex items-center space-x-2">
                  <Checkbox 
                    id={field}
                    checked={selectedFields.includes(field)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedFields([...selectedFields, field]);
                      } else {
                        setSelectedFields(selectedFields.filter(f => f !== field));
                      }
                    }}
                  />
                  <label htmlFor={field} className="text-sm capitalize">
                    {field.replace('_', ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
