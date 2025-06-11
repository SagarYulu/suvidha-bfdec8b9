
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter, RefreshCw } from 'lucide-react';

interface FeedbackFiltersPanelProps {
  onFiltersChange: (filters: any) => void;
  onComparisonToggle: (enabled: boolean) => void;
}

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({
  onFiltersChange,
  onComparisonToggle
}) => {
  const [filters, setFilters] = useState({
    city: '',
    cluster: '',
    sentiment: '',
    dateRange: ''
  });
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleComparisonToggle = (enabled: boolean) => {
    setComparisonEnabled(enabled);
    onComparisonToggle(enabled);
  };

  const resetFilters = () => {
    const emptyFilters = {
      city: '',
      cluster: '',
      sentiment: '',
      dateRange: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Cities</SelectItem>
              <SelectItem value="bangalore">Bangalore</SelectItem>
              <SelectItem value="delhi">Delhi</SelectItem>
              <SelectItem value="mumbai">Mumbai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="cluster">Cluster</Label>
          <Select value={filters.cluster} onValueChange={(value) => handleFilterChange('cluster', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Clusters</SelectItem>
              <SelectItem value="north">North</SelectItem>
              <SelectItem value="south">South</SelectItem>
              <SelectItem value="east">East</SelectItem>
              <SelectItem value="west">West</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sentiment">Sentiment</Label>
          <Select value={filters.sentiment} onValueChange={(value) => handleFilterChange('sentiment', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Sentiments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sentiments</SelectItem>
              <SelectItem value="happy">Happy</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="sad">Sad</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch 
            id="comparison" 
            checked={comparisonEnabled}
            onCheckedChange={handleComparisonToggle}
          />
          <Label htmlFor="comparison">Enable Comparison</Label>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={resetFilters}
          className="w-full"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
