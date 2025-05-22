
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { CalendarIcon, FilterIcon, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';
import { FeedbackFilters } from '@/services/feedbackAnalyticsService';
import { supabase } from '@/integrations/supabase/client';

interface FeedbackFiltersPanelProps {
  filters: FeedbackFilters;
  onFilterChange: (filters: Partial<FeedbackFilters>) => void;
  isComparisonEnabled: boolean;
  onComparisonToggle: (enabled: boolean) => void;
}

const COMPARISON_OPTIONS = [
  { value: 'dod', label: 'Day on Day' },
  { value: 'wow', label: 'Week on Week' },
  { value: 'mom', label: 'Month on Month' },
  { value: 'qoq', label: 'Quarter on Quarter' },
  { value: 'yoy', label: 'Year on Year' }
];

const FeedbackFiltersPanel: React.FC<FeedbackFiltersPanelProps> = ({
  filters,
  onFilterChange,
  isComparisonEnabled,
  onComparisonToggle
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: filters.startDate ? new Date(filters.startDate) : undefined,
    to: filters.endDate ? new Date(filters.endDate) : undefined
  });
  
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [clusters, setClusters] = useState<{ id: string; name: string; city_id: string }[]>([]);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Fetch cities, clusters and agents from master data
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch cities
        const { data: citiesData, error: citiesError } = await supabase
          .from('master_cities')
          .select('id, name')
          .order('name');
        
        if (citiesError) throw citiesError;
        setCities(citiesData || []);
        
        // Fetch clusters
        const { data: clustersData, error: clustersError } = await supabase
          .from('master_clusters')
          .select('id, name, city_id')
          .order('name');
        
        if (clustersError) throw clustersError;
        setClusters(clustersData || []);
        
        // Fetch agents (employees who close tickets)
        const { data: agentsData, error: agentsError } = await supabase
          .from('dashboard_users')
          .select('id, name')
          .order('name');
        
        if (agentsError) throw agentsError;
        setAgents(agentsData || []);
        
      } catch (error) {
        console.error('Error fetching filter options:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFilterOptions();
  }, []);
  
  // Update date range when selection changes
  useEffect(() => {
    if (dateRange?.from) {
      onFilterChange({
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : format(dateRange.from, 'yyyy-MM-dd')
      });
      
      // If a complete range is selected, close the calendar
      if (dateRange.to) {
        setTimeout(() => {
          setIsCalendarOpen(false);
        }, 300); // Slight delay to allow state updates
      }
    }
  }, [dateRange, onFilterChange]);
  
  // Handle comparison mode toggle
  const handleComparisonToggle = (checked: boolean) => {
    onComparisonToggle(checked);
    if (checked && (!filters.comparisonMode || filters.comparisonMode === 'none')) {
      // Default to week on week comparison when enabling
      onFilterChange({ comparisonMode: 'wow' });
    }
  };
  
  // Get available clusters based on selected city
  const availableClusters = filters.city
    ? clusters.filter(cluster => {
        const cityObj = cities.find(c => c.name === filters.city);
        return cityObj && cluster.city_id === cityObj.id;
      })
    : clusters;
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Date Range */}
          <div>
            <Label className="mb-1 block">Date Range</Label>
            <Popover 
              open={isCalendarOpen} 
              onOpenChange={setIsCalendarOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} -{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Select date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-0" 
                align="start"
                style={{ zIndex: 50 }}
              >
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {/* City Filter */}
          <div>
            <Label className="mb-1 block">City</Label>
            <Select 
              value={filters.city || "all"}
              onValueChange={(value) => {
                // Reset cluster when city changes
                onFilterChange({ city: value === "all" ? undefined : value, cluster: undefined });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Cities" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Cities</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Cluster Filter */}
          <div>
            <Label className="mb-1 block">Cluster</Label>
            <Select 
              value={filters.cluster || "all"}
              onValueChange={(value) => onFilterChange({ cluster: value === "all" ? undefined : value })}
              disabled={!filters.city || availableClusters.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  filters.city ? "All Clusters" : "Select City First"
                } />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Clusters</SelectItem>
                {availableClusters.map(cluster => (
                  <SelectItem key={cluster.id} value={cluster.name}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Agent Filter */}
          <div>
            <Label className="mb-1 block">Agent</Label>
            <Select 
              value={filters.agentId || "all"}
              onValueChange={(value) => onFilterChange({ agentId: value === "all" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Comparison Mode */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <Label htmlFor="comparison-toggle">Comparison</Label>
              <Switch 
                id="comparison-toggle" 
                checked={isComparisonEnabled} 
                onCheckedChange={handleComparisonToggle}
              />
            </div>
            <Select 
              value={filters.comparisonMode || 'wow'}
              onValueChange={(value) => onFilterChange({ 
                comparisonMode: value || 'none' 
              })}
              disabled={!isComparisonEnabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select comparison" />
              </SelectTrigger>
              <SelectContent className="bg-white z-50">
                {COMPARISON_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Sentiment Filter (moved to second row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 mt-4">
          <div>
            <Label className="mb-1 block">Sentiment</Label>
            <Select 
              value={filters.sentiment || "all"}
              onValueChange={(value) => onFilterChange({ 
                sentiment: (value === "all" ? undefined : value) as 'happy' | 'neutral' | 'sad' | undefined
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Sentiments" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Reset Filters Button */}
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline"
            onClick={() => {
              // Reset all filters but keep date range
              onFilterChange({
                city: undefined,
                cluster: undefined,
                sentiment: undefined,
                agentId: undefined,
                employeeUuid: undefined,
              });
              // Also reset comparison if enabled
              if (isComparisonEnabled) {
                onComparisonToggle(false);
              }
            }}
          >
            <X className="w-4 h-4 mr-1" /> Reset Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
