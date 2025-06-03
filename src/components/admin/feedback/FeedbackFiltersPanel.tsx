
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, Filter } from 'lucide-react';
import { FeedbackFilters } from '@/services/feedbackAnalyticsService';

interface FeedbackFiltersPanelProps {
  filters: FeedbackFilters;
  onFilterChange: (filters: Partial<FeedbackFilters>) => void;
  isComparisonEnabled: boolean;
  onComparisonToggle: (enabled: boolean) => void;
}

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({
  filters,
  onFilterChange,
  isComparisonEnabled,
  onComparisonToggle
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Filter className="mr-2 h-5 w-5" />
          Filters & Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => onFilterChange({ startDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => onFilterChange({ endDate: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="sentiment">Sentiment</Label>
            <Select value={filters.sentiment || 'all'} onValueChange={(value) => onFilterChange({ sentiment: value === 'all' ? undefined : value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="All Sentiments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="Filter by city"
              value={filters.city || ''}
              onChange={(e) => onFilterChange({ city: e.target.value || undefined })}
            />
          </div>
          
          <div>
            <Label htmlFor="cluster">Cluster</Label>
            <Input
              id="cluster"
              placeholder="Filter by cluster"
              value={filters.cluster || ''}
              onChange={(e) => onFilterChange({ cluster: e.target.value || undefined })}
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-4 border-t">
          <Switch
            id="comparison"
            checked={isComparisonEnabled}
            onCheckedChange={onComparisonToggle}
          />
          <Label htmlFor="comparison">Enable Period Comparison</Label>
        </div>

        {isComparisonEnabled && (
          <div>
            <Label htmlFor="comparisonMode">Comparison Mode</Label>
            <Select value={filters.comparisonMode || 'wow'} onValueChange={(value) => onFilterChange({ comparisonMode: value as any })}>
              <SelectTrigger>
                <SelectValue placeholder="Select comparison period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dod">Day over Day</SelectItem>
                <SelectItem value="wow">Week over Week</SelectItem>
                <SelectItem value="mom">Month over Month</SelectItem>
                <SelectItem value="qoq">Quarter over Quarter</SelectItem>
                <SelectItem value="yoy">Year over Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
