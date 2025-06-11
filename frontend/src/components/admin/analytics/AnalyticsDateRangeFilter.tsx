
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface AnalyticsDateRangeFilterProps {
  onDateRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
}

const AnalyticsDateRangeFilter: React.FC<AnalyticsDateRangeFilterProps> = ({
  onDateRangeChange,
  initialRange
}) => {
  const [dateRange, setDateRange] = useState<DateRange>(
    initialRange || { from: undefined, to: undefined }
  );

  const handleQuickSelect = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days);
    
    const newRange = { from, to };
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const quickRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last 365 days', days: 365 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Date Range Filter
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {quickRanges.map((range) => (
              <Button
                key={range.days}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSelect(range.days)}
              >
                {range.label}
              </Button>
            ))}
          </div>
          
          {dateRange.from && dateRange.to && (
            <div className="text-sm text-muted-foreground">
              Selected: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsDateRangeFilter;
