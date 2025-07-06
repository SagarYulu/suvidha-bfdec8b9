
import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChartHorizontalBig, BarChart3 } from 'lucide-react';

export type ComparisonMode = 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';

export interface ComparisonModeDropdownProps {
  value: ComparisonMode;
  onChange: (mode: ComparisonMode) => void;
  disabled?: boolean;
}

export const COMPARISON_MODE_LABELS: Record<string, string> = {
  'none': 'No Comparison',
  'dod': 'Day over Day',
  'wow': 'Week over Week',
  'mom': 'Month over Month',
  'qoq': 'Quarter over Quarter',
  'yoy': 'Year over Year'
};

const ComparisonModeDropdown: React.FC<ComparisonModeDropdownProps> = ({
  value,
  onChange,
  disabled = false
}) => {
  return (
    <Select 
      value={value} 
      onValueChange={onChange as (value: string) => void}
      disabled={disabled}
    >
      <SelectTrigger className={`w-[145px] ${disabled ? 'opacity-50' : ''}`}>
        <SelectValue placeholder="Select comparison" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="wow">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" /> Week-over-Week
            </div>
          </SelectItem>
          <SelectItem value="mom">
            <div className="flex items-center">
              <BarChartHorizontalBig className="h-4 w-4 mr-2" /> Month-over-Month
            </div>
          </SelectItem>
          <SelectItem value="qoq">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" /> Quarter-over-Quarter
            </div>
          </SelectItem>
          <SelectItem value="yoy">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" /> Year-over-Year
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};

export default ComparisonModeDropdown;
