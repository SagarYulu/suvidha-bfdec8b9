
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, RefreshCw } from 'lucide-react';

interface FeedbackFilters {
  sentiment?: string;
  dateRange?: string;
  city?: string;
  cluster?: string;
  agent?: string;
}

interface FeedbackFiltersPanelProps {
  filters: FeedbackFilters;
  onFiltersChange: (filters: FeedbackFilters) => void;
  onReset: () => void;
  isLoading?: boolean;
}

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({
  filters,
  onFiltersChange,
  onReset,
  isLoading = false
}) => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'];
  const clusters = ['North', 'South', 'East', 'West', 'Central'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Feedback Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Sentiment</label>
            <Select 
              value={filters.sentiment || ''} 
              onValueChange={(value) => onFiltersChange({...filters, sentiment: value || undefined})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All sentiments</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select 
              value={filters.dateRange || ''} 
              onValueChange={(value) => onFiltersChange({...filters, dateRange: value || undefined})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All time</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">City</label>
            <Select 
              value={filters.city || ''} 
              onValueChange={(value) => onFiltersChange({...filters, city: value || undefined})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cluster</label>
            <Select 
              value={filters.cluster || ''} 
              onValueChange={(value) => onFiltersChange({...filters, cluster: value || undefined})}
            >
              <SelectTrigger>
                <SelectValue placeholder="All clusters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All clusters</SelectItem>
                {clusters.map(cluster => (
                  <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={onReset}
            disabled={isLoading}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
