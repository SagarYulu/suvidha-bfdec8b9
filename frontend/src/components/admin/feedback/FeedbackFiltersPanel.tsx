
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

interface FeedbackFilters {
  dateRange: { start: Date | undefined; end: Date | undefined };
  city: string | undefined;
  cluster: string | undefined;
  role: string | undefined;
}

interface FeedbackFiltersPanelProps {
  filters: FeedbackFilters;
  onFiltersChange: (filters: FeedbackFilters) => void;
}

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({
  filters,
  onFiltersChange
}) => {
  const handleFilterChange = (key: keyof FeedbackFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      dateRange: { start: undefined, end: undefined },
      city: undefined,
      cluster: undefined,
      role: undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Feedback Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <DateRangePicker
              startDate={filters.dateRange.start}
              endDate={filters.dateRange.end}
              onDateRangeChange={(start, end) => 
                handleFilterChange('dateRange', { start, end })
              }
              placeholder="Select date range"
            />
          </div>
          
          <Select 
            value={filters.city || ''} 
            onValueChange={(value) => handleFilterChange('city', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              <SelectItem value="Bangalore">Bangalore</SelectItem>
              <SelectItem value="Delhi">Delhi</SelectItem>
              <SelectItem value="Mumbai">Mumbai</SelectItem>
              <SelectItem value="Pune">Pune</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={filters.cluster || ''} 
            onValueChange={(value) => handleFilterChange('cluster', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clusters</SelectItem>
              <SelectItem value="North">North</SelectItem>
              <SelectItem value="South">South</SelectItem>
              <SelectItem value="East">East</SelectItem>
              <SelectItem value="West">West</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Select 
              value={filters.role || ''} 
              onValueChange={(value) => handleFilterChange('role', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="DE">Delivery Executive</SelectItem>
                <SelectItem value="FM">Field Manager</SelectItem>
                <SelectItem value="AM">Area Manager</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon" onClick={clearFilters}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
