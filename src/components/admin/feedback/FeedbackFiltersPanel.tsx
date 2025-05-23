import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FeedbackFilters } from '@/services/feedbackAnalyticsService';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ChevronDown, BarChartHorizontalBig, BarChart3, Users } from 'lucide-react';
import { format } from 'date-fns';
import ComparisonModeDropdown from '../sentiment/ComparisonModeDropdown';
import { ComparisonMode } from '../sentiment/ComparisonModeDropdown';
import { supabase } from '@/integrations/supabase/client';

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
  const [date, setDate] = useState<Date | undefined>(filters.startDate ? new Date(filters.startDate) : undefined);
  const [toDate, setToDate] = useState<Date | undefined>(filters.endDate ? new Date(filters.endDate) : undefined);
  const [open, setOpen] = React.useState(false);
  const [openTo, setOpenTo] = React.useState(false);
  
  // Add state for available agents
  const [agents, setAgents] = useState<{id: string, name: string}[]>([]);
  
  // Fetch agent data
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const { data, error } = await supabase
          .from('dashboard_users')
          .select('id, name')
          .order('name');
          
        if (error) {
          console.error('Error fetching agents:', error);
          return;
        }
        
        setAgents(data || []);
      } catch (err) {
        console.error('Failed to fetch agents:', err);
      }
    };
    
    fetchAgents();
  }, []);
  
  const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
  const formattedToDate = toDate ? format(toDate, 'yyyy-MM-dd') : '';
  
  const handleDateChange = (newDate: Date | undefined) => {
    setDate(newDate);
    if (newDate) {
      const formatted = format(newDate, 'yyyy-MM-dd');
      onFilterChange({ startDate: formatted });
    } else {
      onFilterChange({ startDate: undefined });
    }
  };
  
  const handleToDateChange = (newToDate: Date | undefined) => {
    setToDate(newToDate);
    if (newToDate) {
      const formatted = format(newToDate, 'yyyy-MM-dd');
      onFilterChange({ endDate: formatted });
    } else {
      onFilterChange({ endDate: undefined });
    }
  };
  
  // Add agent filter handler
  const handleAgentChange = (agentId: string | null) => {
    onFilterChange({
      agentId: agentId === 'all' ? undefined : agentId || undefined,
      // Also update agent name for display purposes
      agentName: agentId === 'all' ? undefined : 
        agents.find(a => a.id === agentId)?.name
    });
  };
  
  const handleComparisonToggle = (checked: boolean) => {
    onComparisonToggle(checked);
  };
  
  const handleComparisonModeChange = (mode: ComparisonMode) => {
    onFilterChange({ comparisonMode: mode });
  };
  
  const handleApplyFilters = () => {
    // Apply any additional logic here before applying filters
    console.log('Applying filters:', filters);
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Date Range Filter */}
          <div>
            <Label htmlFor="date-range" className="mb-2 block">Date Range</Label>
            <div className="flex space-x-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={
                      'w-[140px] justify-start text-left font-normal' +
                      (date ? ' text-foreground' : ' text-muted-foreground')
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formattedDate ? formattedDate : <span>Pick a date</span>}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2023-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover open={openTo} onOpenChange={setOpenTo}>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={
                      'w-[140px] justify-start text-left font-normal' +
                      (toDate ? ' text-foreground' : ' text-muted-foreground')
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formattedToDate ? formattedToDate : <span>Pick a date</span>}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={handleToDateChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('2023-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* City Filter */}
          <div>
            <Label htmlFor="city-filter" className="mb-2 block">City</Label>
            <Input 
              type="text" 
              id="city-filter" 
              placeholder="Enter city" 
              value={filters.city || ''}
              onChange={(e) => onFilterChange({ city: e.target.value })}
            />
          </div>
          
          {/* Agent Filter - NEW */}
          <div>
            <Label htmlFor="agent-filter" className="mb-2 block">Agent</Label>
            <Select 
              value={filters.agentId || 'all'} 
              onValueChange={handleAgentChange}
            >
              <SelectTrigger id="agent-filter" className="w-full">
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" /> All Agents
                    </div>
                  </SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Comparison Control */}
          <div>
            <Label htmlFor="comparison-toggle" className="mb-2 block">Enable Comparison</Label>
            <div className="flex items-center space-x-2">
              <Switch 
                id="comparison-toggle"
                checked={isComparisonEnabled}
                onCheckedChange={handleComparisonToggle}
              />
              <ComparisonModeDropdown 
                value={filters.comparisonMode || 'none'}
                onChange={handleComparisonModeChange}
                disabled={!isComparisonEnabled}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackFiltersPanel;
