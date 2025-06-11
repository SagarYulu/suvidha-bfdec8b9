
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Download, FileText } from 'lucide-react';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (options: ExportOptions) => Promise<void>;
}

interface ExportOptions {
  format: string;
  includeMetadata: boolean;
  fields: string[];
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onOpenChange,
  onExport
}) => {
  const [format, setFormat] = useState('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const availableFields = [
    'issue_id',
    'employee_name',
    'status',
    'priority',
    'created_date',
    'resolved_date',
    'feedback_score',
    'sentiment'
  ];

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await onExport({
        format,
        includeMetadata,
        fields: selectedFields
      });

      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        onOpenChange(false);
        setProgress(0);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>

        {isExporting ? (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Preparing export...</p>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Fields to Export</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableFields.map((field) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={field}
                      checked={selectedFields.includes(field)}
                      onCheckedChange={() => handleFieldToggle(field)}
                    />
                    <label htmlFor={field} className="text-sm">
                      {field.replace('_', ' ').toUpperCase()}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="metadata"
                checked={includeMetadata}
                onCheckedChange={setIncludeMetadata}
              />
              <label htmlFor="metadata" className="text-sm">
                Include metadata and timestamps
              </label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || selectedFields.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
