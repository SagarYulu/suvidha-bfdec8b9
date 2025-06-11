
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';
import { IssueFilters } from '@/services/issues/issueFilters';

interface FilterBarProps {
  onFilterChange: (filters: IssueFilters) => void;
  initialFilters?: IssueFilters;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, initialFilters }) => {
  const [activeFilters, setActiveFilters] = useState<IssueFilters>(initialFilters || {});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (initialFilters) {
      setActiveFilters(initialFilters);
    }
  }, [initialFilters]);

  const cities = ['Bangalore', 'Delhi', 'Mumbai', 'Hyderabad', 'Chennai', 'Pune'];
  const issueTypes = ['Salary', 'Leave', 'Performance', 'Technical', 'Administrative'];
  const clusters = ['North', 'South', 'East', 'West', 'Central'];

  const handleFilterChange = (key: keyof IssueFilters, value: string | null) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilter = (key: keyof IssueFilters) => {
    handleFilterChange(key, null);
  };

  const clearAllFilters = () => {
    const clearedFilters: IssueFilters = {
      city: null,
      cluster: null, 
      issueType: null
    };
    setActiveFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.values(activeFilters).filter(value => value !== null && value !== undefined).length;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeFilters.city && (
              <Badge variant="outline" className="flex items-center gap-1">
                City: {activeFilters.city}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter('city')}
                />
              </Badge>
            )}
            {activeFilters.cluster && (
              <Badge variant="outline" className="flex items-center gap-1">
                Cluster: {activeFilters.cluster}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter('cluster')}
                />
              </Badge>
            )}
            {activeFilters.issueType && (
              <Badge variant="outline" className="flex items-center gap-1">
                Type: {activeFilters.issueType}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => clearFilter('issueType')}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">City</label>
              <div className="flex flex-wrap gap-2">
                {cities.map(city => (
                  <Button
                    key={city}
                    variant={activeFilters.city === city ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('city', city)}
                  >
                    {city}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Issue Type</label>
              <div className="flex flex-wrap gap-2">
                {issueTypes.map(type => (
                  <Button
                    key={type}
                    variant={activeFilters.issueType === type ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('issueType', type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Cluster</label>
              <div className="flex flex-wrap gap-2">
                {clusters.map(cluster => (
                  <Button
                    key={cluster}
                    variant={activeFilters.cluster === cluster ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('cluster', cluster)}
                  >
                    {cluster}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilterBar;
