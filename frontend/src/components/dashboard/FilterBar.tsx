
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  initialFilters: any;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, initialFilters }) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <Select
            value={initialFilters.city || 'all'}
            onValueChange={(value) => onFilterChange({ city: value === 'all' ? null : value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="pune">Pune</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={initialFilters.cluster || 'all'}
            onValueChange={(value) => onFilterChange({ cluster: value === 'all' ? null : value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Cluster" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clusters</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="east">East</SelectItem>
              <SelectItem value="west">West</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={initialFilters.issueType || 'all'}
            onValueChange={(value) => onFilterChange({ issueType: value === 'all' ? null : value })}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Issue Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="tech">Technical</SelectItem>
              <SelectItem value="ops">Operations</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
