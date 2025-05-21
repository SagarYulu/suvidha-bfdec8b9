
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ComparisonMode = 'none' | 'day' | 'week' | 'month' | 'quarter' | 'year';

interface ComparisonModeDropdownProps {
  value: ComparisonMode;
  onChange: (value: ComparisonMode) => void;
}

const ComparisonModeDropdown: React.FC<ComparisonModeDropdownProps> = ({
  value,
  onChange
}) => {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">Compare To</label>
      <Select value={value} onValueChange={(v) => onChange(v as ComparisonMode)}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="No Comparison" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">No Comparison</SelectItem>
          <SelectItem value="day">Previous Day</SelectItem>
          <SelectItem value="week">Previous Week</SelectItem>
          <SelectItem value="month">Previous Month</SelectItem>
          <SelectItem value="quarter">Previous Quarter</SelectItem>
          <SelectItem value="year">Previous Year</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ComparisonModeDropdown;
