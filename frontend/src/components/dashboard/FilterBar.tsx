
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterBarProps {
  onFilterChange: (filters: {
    dateFrom?: string;
    dateTo?: string;
    city?: string;
    cluster?: string;
  }) => void;
  initialFilters?: {
    dateFrom?: string;
    dateTo?: string;
    city?: string;
    cluster?: string;
  };
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, initialFilters = {} }) => {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    initialFilters.dateFrom ? new Date(initialFilters.dateFrom) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    initialFilters.dateTo ? new Date(initialFilters.dateTo) : undefined
  );
  const [city, setCity] = useState<string>(initialFilters.city || '');
  const [cluster, setCluster] = useState<string>(initialFilters.cluster || '');

  const cities = ['Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'];
  const clusters = ['North', 'South', 'East', 'West', 'Central'];

  const handleApplyFilters = () => {
    const filters = {
      dateFrom: dateFrom?.toISOString().split('T')[0],
      dateTo: dateTo?.toISOString().split('T')[0],
      city: city || undefined,
      cluster: cluster || undefined,
    };
    
    // Remove undefined values
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
    
    onFilterChange(cleanFilters);
  };

  const handleReset = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setCity('');
    setCluster('');
    onFilterChange({});
  };

  useEffect(() => {
    handleApplyFilters();
  }, [dateFrom, dateTo, city, cluster]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters:
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">From Date</label>
            <DatePicker
              date={dateFrom}
              onDateChange={setDateFrom}
              placeholder="Select start date"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">To Date</label>
            <DatePicker
              date={dateTo}
              onDateChange={setDateTo}
              placeholder="Select end date"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">City</label>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cities.map((cityOption) => (
                  <SelectItem key={cityOption} value={cityOption}>
                    {cityOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-600">Cluster</label>
            <Select value={cluster} onValueChange={setCluster}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Clusters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clusters</SelectItem>
                {clusters.map((clusterOption) => (
                  <SelectItem key={clusterOption} value={clusterOption}>
                    {clusterOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="h-10"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterBar;
