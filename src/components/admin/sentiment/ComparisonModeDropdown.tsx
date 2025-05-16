
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';

export type ComparisonMode = 'none' | 'wow' | 'mom' | 'qoq' | 'yoy';

export const COMPARISON_MODE_LABELS: Record<ComparisonMode, string> = {
  'none': 'No Comparison',
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
  return (
    <div className="w-full">
      <label className="text-sm font-medium mb-1 block">Comparison Mode</label>
      <Select value={value} onValueChange={(v) => onChange(v as ComparisonMode)}>
        <SelectTrigger>
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
    </div>
  );
};

export default ComparisonModeDropdown;
