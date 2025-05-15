
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, ChevronDown, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

interface SentimentFilterBarProps {
  onFilterChange: (filters: {
    startDate?: string;
    endDate?: string;
    city?: string;
    cluster?: string;
    role?: string;
  }) => void;
}

const SentimentFilterBar: React.FC<SentimentFilterBarProps> = ({ onFilterChange }) => {
  const [city, setCity] = useState<string | undefined>(undefined);
  const [cluster, setCluster] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Fetch cities
  const { data: cities } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_cities')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch clusters based on selected city
  const { data: clusters } = useQuery({
    queryKey: ['clusters', city],
    queryFn: async () => {
      if (!city || city === 'all-cities') return [];
      
      const { data, error } = await supabase
        .from('master_clusters')
        .select('id, name')
        .eq('city_id', city)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!city && city !== 'all-cities'
  });

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('master_roles')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleApplyFilters = () => {
    // Find the city name if a city is selected
    let cityName: string | undefined = undefined;
    
    if (city && city !== 'all-cities') {
      const selectedCity = cities?.find(c => c.id === city);
      cityName = selectedCity?.name;
      console.log("Selected city name:", cityName);
    }
    
    // Find the cluster name if a cluster is selected
    let clusterName: string | undefined = undefined;
    
    if (cluster && cluster !== 'all-clusters') {
      const selectedCluster = clusters?.find(c => c.id === cluster);
      clusterName = selectedCluster?.name;
      console.log("Selected cluster name:", clusterName);
    }
    
    // Find the role name if a role is selected
    let roleName: string | undefined = undefined;
    
    if (role && role !== 'all-roles') {
      const selectedRole = roles?.find(r => r.id === role);
      roleName = selectedRole?.name;
      console.log("Selected role name:", roleName);
    }
    
    // Log the filters for debugging
    const filters = {
      startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
      endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
      city: cityName,
      cluster: clusterName,
      role: roleName
    };
    
    console.log("Applying filters:", filters);
    
    onFilterChange(filters);
  };

  const handleResetFilters = () => {
    setCity(undefined);
    setCluster(undefined);
    setRole(undefined);
    setDateRange(undefined);
    
    // Immediately apply the reset
    onFilterChange({});
    console.log("Filters reset");
  };

  return (
    <Card className="p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Range */}
        <div>
          <label className="text-sm font-medium mb-1 block">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
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
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* City */}
        <div>
          <label className="text-sm font-medium mb-1 block">City</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-cities">All Cities</SelectItem>
              {cities?.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cluster */}
        <div>
          <label className="text-sm font-medium mb-1 block">Cluster</label>
          <Select 
            value={cluster} 
            onValueChange={setCluster}
            disabled={!city || city === 'all-cities'}
          >
            <SelectTrigger>
              <SelectValue placeholder={city && city !== 'all-cities' ? "Select cluster" : "Select city first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-clusters">All Clusters</SelectItem>
              {clusters?.map((cluster) => (
                <SelectItem key={cluster.id} value={cluster.id}>
                  {cluster.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role */}
        <div>
          <label className="text-sm font-medium mb-1 block">Role</label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-roles">All Roles</SelectItem>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={handleResetFilters}>
          <X className="w-4 h-4 mr-1" /> Reset Filters
        </Button>
        <Button onClick={handleApplyFilters}>
          Apply Filters
        </Button>
      </div>
    </Card>
  );
};

export default SentimentFilterBar;
