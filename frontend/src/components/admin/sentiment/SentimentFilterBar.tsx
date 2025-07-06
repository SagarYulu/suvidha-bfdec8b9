
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';

interface ComparisonMode {
  value: 'none' | 'previous_period' | 'previous_month' | 'previous_quarter';
  label: string;
}

interface SentimentFilters {
  startDate?: Date;
  endDate?: Date;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: ComparisonMode;
}

interface SentimentFilterBarProps {
  filters: SentimentFilters;
  onFiltersChange: (filters: SentimentFilters) => void;
  cities?: string[];
  clusters?: string[];
  roles?: string[];
}

const SentimentFilterBar: React.FC<SentimentFilterBarProps> = ({
  filters,
  onFiltersChange,
  cities = ['Bangalore', 'Delhi', 'Mumbai', 'Pune'],
  clusters = ['North', 'South', 'East', 'West'],
  roles = ['DE', 'FM', 'AM', 'City Head']
}) => {
  const comparisonModes: ComparisonMode[] = [
    { value: 'none', label: 'No Comparison' },
    { value: 'previous_period', label: 'Previous Period' },
    { value: 'previous_month', label: 'Previous Month' },
    { value: 'previous_quarter', label: 'Previous Quarter' }
  ];

  const handleFilterChange = (key: keyof SentimentFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      startDate: undefined,
      endDate: undefined,
      city: undefined,
      cluster: undefined,
      role: undefined,
      comparisonMode: { value: 'none', label: 'No Comparison' }
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4" />
          <span className="font-medium">Sentiment Filters</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Date Range */}
          <div className="md:col-span-2">
            <DateRangePicker
              startDate={filters.startDate}
              endDate={filters.endDate}
              onDateRangeChange={(start, end) => {
                handleFilterChange('startDate', start);
                handleFilterChange('endDate', end);
              }}
              placeholder="Select date range"
            />
          </div>
          
          {/* City */}
          <Select 
            value={filters.city || ''} 
            onValueChange={(value) => handleFilterChange('city', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              {cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Cluster */}
          <Select 
            value={filters.cluster || ''} 
            onValueChange={(value) => handleFilterChange('cluster', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clusters</SelectItem>
              {clusters.map(cluster => (
                <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Role */}
          <Select 
            value={filters.role || ''} 
            onValueChange={(value) => handleFilterChange('role', value || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Comparison Mode and Clear Button */}
          <div className="flex gap-2">
            <Select 
              value={filters.comparisonMode?.value || 'none'} 
              onValueChange={(value) => {
                const mode = comparisonModes.find(m => m.value === value);
                handleFilterChange('comparisonMode', mode);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="No Comparison" />
              </SelectTrigger>
              <SelectContent>
                {comparisonModes.map(mode => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
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

export default SentimentFilterBar;
