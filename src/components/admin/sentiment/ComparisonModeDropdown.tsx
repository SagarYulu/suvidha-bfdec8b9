
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ComparisonMode = 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';

export const COMPARISON_MODE_LABELS: Record<ComparisonMode, string> = {
  none: 'No Comparison',
  dod: 'Day over Day',
  wow: 'Week over Week',
  mom: 'Month over Month',
  qoq: 'Quarter over Quarter',
  yoy: 'Year over Year',
};

interface ComparisonModeDropdownProps {
  value: ComparisonMode;
  onChange: (mode: ComparisonMode) => void;
  disabled?: boolean;
}

const ComparisonModeDropdown: React.FC<ComparisonModeDropdownProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <Select 
      value={value} 
      onValueChange={(val) => onChange(val as ComparisonMode)}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select comparison" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No Comparison</SelectItem>
        <SelectItem value="dod">Day over Day</SelectItem>
        <SelectItem value="wow">Week over Week</SelectItem>
        <SelectItem value="mom">Month over Month</SelectItem>
        <SelectItem value="qoq">Quarter over Quarter</SelectItem>
        <SelectItem value="yoy">Year over Year</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default ComparisonModeDropdown;
