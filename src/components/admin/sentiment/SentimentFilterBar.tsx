
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { mockSupabase as supabase } from '@/lib/mockSupabase';

interface SentimentFilterBarProps {
  onFiltersChange: (filters: any) => void;
}

const SentimentFilterBar: React.FC<SentimentFilterBarProps> = ({ onFiltersChange }) => {
  const [cities, setCities] = useState<any[]>([]);
  const [clusters, setClusters] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    dateRange: '',
    city: '',
    cluster: '',
    agent: '',
    sentiment: ''
  });

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Fetch cities
      const citiesResponse = await supabase.from('master_cities').select('*');
      const citiesResult = await citiesResponse.maybeSingle();
      setCities(citiesResult.data || []);

      // Fetch clusters
      const clustersResponse = await supabase.from('master_clusters').select('*');
      const clustersResult = await clustersResponse.maybeSingle();
      setClusters(clustersResult.data || []);

      // Fetch agents from employees
      const agentsResponse = await supabase.from('employees').select('*');
      const agentsResult = await agentsResponse.maybeSingle();
      setAgents(agentsResult.data || []);
    } catch (error) {
      console.error('Error fetching filter options:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: '',
      city: '',
      cluster: '',
      agent: '',
      sentiment: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Input
              type="date"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">City</label>
            <Select value={filters.city} onValueChange={(value) => handleFilterChange('city', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Cluster</label>
            <Select value={filters.cluster} onValueChange={(value) => handleFilterChange('cluster', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clusters</SelectItem>
                {clusters.map((cluster) => (
                  <SelectItem key={cluster.id} value={cluster.name}>
                    {cluster.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Agent</label>
            <Select value={filters.agent} onValueChange={(value) => handleFilterChange('agent', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.name}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Sentiment</label>
            <Select value={filters.sentiment} onValueChange={(value) => handleFilterChange('sentiment', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sentiments</SelectItem>
                <SelectItem value="happy">Happy</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="sad">Sad</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button variant="outline" onClick={clearFilters} className="w-full">
              Clear Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentFilterBar;
