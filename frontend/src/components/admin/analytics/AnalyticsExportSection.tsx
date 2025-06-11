
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsExportSectionProps {
  onExport: (format: string, dateRange: any) => void;
  isLoading?: boolean;
}

const AnalyticsExportSection: React.FC<AnalyticsExportSectionProps> = ({
  onExport,
  isLoading = false
}) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const { toast } = useToast();

  const handleExport = () => {
    if (isLoading) return;
    
    onExport(exportFormat, {});
    toast({
      title: "Export Started",
      description: `Your ${exportFormat.toUpperCase()} export is being prepared.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Export Format</label>
          <Select value={exportFormat} onValueChange={setExportFormat}>
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

        <Button 
          onClick={handleExport} 
          disabled={isLoading}
          className="w-full"
        >
          <FileText className="mr-2 h-4 w-4" />
          {isLoading ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExportSection;
