
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Filter, RotateCcw } from 'lucide-react';
import { formOptions } from '@/data/formOptions';

interface FeedbackFilters {
  city?: string;
  cluster?: string;
  sentiment?: string;
  dateRange?: string;
  agent?: string;
}

interface FeedbackFiltersPanelProps {
  onFiltersChange: (filters: FeedbackFilters) => void;
  onComparisonToggle: (enabled: boolean) => void;
}

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({
  onFiltersChange,
  onComparisonToggle
}) => {
  const [filters, setFilters] = useState<FeedbackFilters>({});
  const [comparisonEnabled, setComparisonEnabled] = useState(false);

  const updateFilter = (key: keyof FeedbackFilters, value: string) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const handleComparisonToggle = (enabled: boolean) => {
    setComparisonEnabled(enabled);
    onComparisonToggle(enabled);
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
          <Label className="text-sm font-medium">City</Label>
          <Select value={filters.city || 'all'} onValueChange={(value) => updateFilter('city', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {formOptions.cities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Cluster</Label>
          <Select value={filters.cluster || 'all'} onValueChange={(value) => updateFilter('cluster', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Clusters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clusters</SelectItem>
              {formOptions.clusters.map(cluster => (
                <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Sentiment</Label>
          <Select value={filters.sentiment || 'all'} onValueChange={(value) => updateFilter('sentiment', value)}>
            <SelectTrigger>
              <SelectValue placeholder="All Sentiments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="happy">Positive</SelectItem>
              <SelectItem value="neutral">Neutral</SelectItem>
              <SelectItem value="sad">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium">Date Range</Label>
          <Select value={filters.dateRange || 'last30'} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="thisYear">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="comparison-mode"
            checked={comparisonEnabled}
            onCheckedChange={handleComparisonToggle}
          />
          <Label htmlFor="comparison-mode" className="text-sm">
            Enable Comparison Mode
          </Label>
        </div>

        <Button variant="outline" onClick={clearFilters} className="w-full">
          <RotateCcw className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
