
import { useState, useEffect } from 'react';
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

const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const [city, setCity] = useState<string | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<string | null>(null);
  const [availableClusters, setAvailableClusters] = useState<string[]>([]);

  useEffect(() => {
    if (city && CLUSTER_OPTIONS[city]) {
      setAvailableClusters(CLUSTER_OPTIONS[city]);
    } else {
      setCluster(null);
      setAvailableClusters([]);
    }
  }, [city]);

  useEffect(() => {
    onFilterChange({ city, cluster, issueType });
  }, [city, cluster, issueType, onFilterChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 border rounded-md bg-background">
      <div>
        <Label htmlFor="city-filter" className="mb-1 block">City</Label>
        <Select
          value={city || undefined}
          onValueChange={(value) => setCity(value || null)}
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
          value={cluster || undefined}
          onValueChange={(value) => setCluster(value || null)}
          disabled={!city || availableClusters.length === 0}
        >
          <SelectTrigger id="cluster-filter">
            <SelectValue placeholder={city ? "All Clusters" : "Select City First"} />
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
          value={issueType || undefined}
          onValueChange={(value) => setIssueType(value || null)}
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
};

export default FilterBar;
