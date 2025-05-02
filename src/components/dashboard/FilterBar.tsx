
import { useState, useEffect, memo, useCallback } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";

type FilterBarProps = {
  onFilterChange: (filters: {
    city: string | null;
    cluster: string | null;
    issueType: string | null;
  }) => void;
};

// Use memo to prevent unnecessary re-renders
const FilterBar = memo(({ onFilterChange }: FilterBarProps) => {
  const [city, setCity] = useState<string | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<string | null>(null);
  
  // Get available clusters based on selected city
  const availableClusters = city && city !== "all" && CLUSTER_OPTIONS[city] 
    ? CLUSTER_OPTIONS[city] 
    : [];

  // Apply filters immediately when they change
  const applyFilters = useCallback(() => {
    console.log('Applying filters:', { 
      city: city === "all" ? null : city, 
      cluster: cluster === "all" ? null : cluster, 
      issueType: issueType === "all" ? null : issueType 
    });
    
    onFilterChange({ 
      city: city === "all" ? null : city, 
      cluster: cluster === "all" ? null : cluster, 
      issueType: issueType === "all" ? null : issueType 
    });
  }, [city, cluster, issueType, onFilterChange]);

  // Reset cluster when city changes
  useEffect(() => {
    if (city === null || city === "all" || !CLUSTER_OPTIONS[city]) {
      setCluster(null);
    }
    applyFilters();
  }, [city, applyFilters]);
  
  // Apply filter changes for cluster and issueType
  useEffect(() => {
    applyFilters();
  }, [cluster, issueType, applyFilters]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-background">
      <div>
        <Label htmlFor="city-filter" className="mb-1 block">City</Label>
        <Select
          value={city || "all"}
          onValueChange={(value) => setCity(value === "all" ? null : value)}
        >
          <SelectTrigger id="city-filter">
            <SelectValue placeholder="All Cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cities</SelectItem>
            {CITY_OPTIONS.map((cityOption) => (
              <SelectItem key={cityOption} value={cityOption}>
                {cityOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="cluster-filter" className="mb-1 block">Cluster</Label>
        <Select
          value={cluster || "all"}
          onValueChange={(value) => setCluster(value === "all" ? null : value)}
          disabled={!city || city === "all" || availableClusters.length === 0}
        >
          <SelectTrigger id="cluster-filter">
            <SelectValue placeholder={city && city !== "all" ? "All Clusters" : "Select City First"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clusters</SelectItem>
            {availableClusters.map((clusterOption) => (
              <SelectItem key={clusterOption} value={clusterOption}>
                {clusterOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="issue-type-filter" className="mb-1 block">Issue Type</Label>
        <Select
          value={issueType || "all"}
          onValueChange={(value) => setIssueType(value === "all" ? null : value)}
        >
          <SelectTrigger id="issue-type-filter">
            <SelectValue placeholder="All Issue Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Issue Types</SelectItem>
            {ISSUE_TYPES.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

// Display name for debugging
FilterBar.displayName = 'FilterBar';

export default FilterBar;
