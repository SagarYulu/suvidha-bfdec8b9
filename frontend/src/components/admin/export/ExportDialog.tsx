
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Download, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportDialogProps {
  trigger: React.ReactNode;
  onExport: (options: ExportOptions) => void;
  isLoading?: boolean;
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  dateRange: {
    start: string;
    end: string;
  };
  includeComments: boolean;
  includeAttachments: boolean;
  filters: Record<string, any>;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  trigger,
  onExport,
  isLoading = false
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    },
    includeComments: false,
    includeAttachments: false,
    filters: {}
  });
  
  const { toast } = useToast();

  const handleExport = () => {
    if (isLoading) return;
    
    onExport(options);
    setOpen(false);
    toast({
      title: "Export Started",
      description: `Your ${options.format.toUpperCase()} export is being prepared.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Format</label>
            <Select value={options.format} onValueChange={(value: any) => setOptions({...options, format: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <input
                type="date"
                value={options.dateRange.start}
                onChange={(e) => setOptions({
                  ...options,
                  dateRange: { ...options.dateRange, start: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <input
                type="date"
                value={options.dateRange.end}
                onChange={(e) => setOptions({
                  ...options,
                  dateRange: { ...options.dateRange, end: e.target.value }
                })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Include Additional Data</label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="comments"
                checked={options.includeComments}
                onCheckedChange={(checked) => setOptions({...options, includeComments: !!checked})}
              />
              <label htmlFor="comments" className="text-sm">Include Comments</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="attachments"
                checked={options.includeAttachments}
                onCheckedChange={(checked) => setOptions({...options, includeAttachments: !!checked})}
              />
              <label htmlFor="attachments" className="text-sm">Include Attachment URLs</label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={isLoading} className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              {isLoading ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
