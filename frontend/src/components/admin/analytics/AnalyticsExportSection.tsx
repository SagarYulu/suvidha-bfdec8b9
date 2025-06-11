
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Download, FileText, BarChart3 } from 'lucide-react';

interface AnalyticsExportSectionProps {
  onExport: (type: string, format: string, dateRange: any) => void;
}

const AnalyticsExportSection: React.FC<AnalyticsExportSectionProps> = ({ onExport }) => {
  const [exportType, setExportType] = useState('');
  const [format, setFormat] = useState('csv');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!exportType) return;
    
    setIsExporting(true);
    try {
      await onExport(exportType, format, { startDate, endDate });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Export Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Export Type</label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select data to export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sla_metrics">SLA Metrics</SelectItem>
                <SelectItem value="trend_data">Trend Analysis</SelectItem>
                <SelectItem value="feedback_analytics">Feedback Analytics</SelectItem>
                <SelectItem value="sentiment_data">Sentiment Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Format</label>
            <Select value={format} onValueChange={setFormat}>
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
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Date Range</label>
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onDateRangeChange={(start, end) => {
              setStartDate(start);
              setEndDate(end);
            }}
          />
        </div>

        <Button 
          onClick={handleExport}
          disabled={!exportType || isExporting}
          className="w-full"
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Data'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AnalyticsExportSection;
