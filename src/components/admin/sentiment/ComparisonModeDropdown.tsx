import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

export type ComparisonMode = 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';

export const COMPARISON_MODE_LABELS: Record<ComparisonMode, string> = {
  'none': 'No Comparison',
  'dod': 'Day-on-Day',
  'wow': 'Week-on-Week',
  'mom': 'Month-on-Month',
  'qoq': 'Quarter-on-Quarter',
  'yoy': 'Year-on-Year'
};

interface ComparisonModeDropdownProps {
  value: ComparisonMode;
  onChange: (value: ComparisonMode) => void;
}

const ComparisonModeDropdown: React.FC<ComparisonModeDropdownProps> = ({ value, onChange }) => {
  const isComparisonActive = value !== 'none';
  
  return (
    <div className="w-full">
      <label className="text-sm font-medium mb-1 block">
        Comparison Mode
        {isComparisonActive && (
          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Active
          </span>
        )}
      </label>
      <Select value={value} onValueChange={(v) => onChange(v as ComparisonMode)}>
        <SelectTrigger className={isComparisonActive ? "border-blue-500" : ""}>
          <SelectValue placeholder="Select comparison mode" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(COMPARISON_MODE_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isComparisonActive && (
        <p className="mt-1 text-xs text-gray-500">
          Comparing current data with {COMPARISON_MODE_LABELS[value].toLowerCase()} period
        </p>
      )}
    </div>
  );
};

export default ComparisonModeDropdown;
