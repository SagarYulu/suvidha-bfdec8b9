
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw } from 'lucide-react';
import ComparisonModeDropdown from './ComparisonModeDropdown';

interface SentimentFilters {
  startDate?: Date;
  endDate?: Date;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: any;
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
            <ComparisonModeDropdown
              value={filters.comparisonMode}
              onChange={(mode) => handleFilterChange('comparisonMode', mode)}
            />
            
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
