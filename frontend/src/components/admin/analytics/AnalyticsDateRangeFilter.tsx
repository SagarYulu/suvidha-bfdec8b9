
import React from 'react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Label } from '@/components/ui/label';

interface AnalyticsDateRangeFilterProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
}

const AnalyticsDateRangeFilter: React.FC<AnalyticsDateRangeFilterProps> = ({
  startDate,
  endDate,
  onDateRangeChange
}) => {
  return (
    <div className="space-y-2">
      <Label>Date Range</Label>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={onDateRangeChange}
        placeholder="Select date range"
      />
    </div>
  );
};

export default AnalyticsDateRangeFilter;
