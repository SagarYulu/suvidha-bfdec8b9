
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, CalendarDays } from 'lucide-react';

interface DateRange {
  start: string;
  end: string;
}

interface AnalyticsDateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  presets?: Array<{ label: string; value: DateRange }>;
}

const AnalyticsDateRangeFilter: React.FC<AnalyticsDateRangeFilterProps> = ({
  dateRange,
  onDateRangeChange,
  presets = [
    { label: 'Last 7 days', value: { start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] } },
    { label: 'Last 30 days', value: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] } },
    { label: 'Last 90 days', value: { start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], end: new Date().toISOString().split('T')[0] } }
  ]
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Quick Presets</label>
          <div className="grid grid-cols-1 gap-2">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => onDateRangeChange(preset.value)}
                className="justify-start"
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDateRangeFilter;
