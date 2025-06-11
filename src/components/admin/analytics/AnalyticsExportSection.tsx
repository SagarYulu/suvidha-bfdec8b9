
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Table } from 'lucide-react';

interface AnalyticsExportSectionProps {
  onExport?: (format: 'pdf' | 'csv' | 'excel') => Promise<void>;
}

const AnalyticsExportSection: React.FC<AnalyticsExportSectionProps> = ({ onExport }) => {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    if (!onExport) {
      console.log('Export handler not provided');
      return;
    }
    
    setIsExporting(format);
    try {
      await onExport(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isExporting === 'pdf'}
            className="h-16 flex flex-col gap-2"
          >
            <FileText className="h-6 w-6" />
            <span>PDF Report</span>
            {isExporting === 'pdf' && <span className="text-xs">Exporting...</span>}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={isExporting === 'csv'}
            className="h-16 flex flex-col gap-2"
          >
            <Table className="h-6 w-6" />
            <span>CSV Data</span>
            {isExporting === 'csv' && <span className="text-xs">Exporting...</span>}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isExporting === 'excel'}
            className="h-16 flex flex-col gap-2"
          >
            <Table className="h-6 w-6" />
            <span>Excel File</span>
            {isExporting === 'excel' && <span className="text-xs">Exporting...</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExportSection;
