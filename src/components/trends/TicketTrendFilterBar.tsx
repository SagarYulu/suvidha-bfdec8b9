
import { useState, useEffect, memo } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { format, addDays, subMonths } from "date-fns";
import { TrendFilters } from '@/services/issues/ticketTrendService';
import { ISSUE_TYPES } from "@/config/issueTypes";
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";

// Comparison modes
const COMPARISON_MODES: {value: "day" | "week" | "month" | "quarter" | "year"; label: string}[] = [
  { value: "day", label: "Day-on-Day" },
  { value: "week", label: "Week-on-Week" },
  { value: "month", label: "Month-on-Month" },
  { value: "quarter", label: "Quarter-on-Quarter" },
  { value: "year", label: "Year-on-Year" }
];

type TicketTrendFilterBarProps = {
  onFilterChange: (filters: TrendFilters) => void;
  initialFilters?: TrendFilters;
  managers: string[];
  roles: string[];
};

const TicketTrendFilterBar = memo(({
  onFilterChange,
  initialFilters,
  managers,
  roles
}: TicketTrendFilterBarProps) => {
  // State to track dropdown values
  const [city, setCity] = useState<string | null>(null);
  const [cluster, setCluster] = useState<string | null>(null);
  const [manager, setManager] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [issueType, setIssueType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const [comparisonMode, setComparisonMode] = useState<"day" | "week" | "month" | "quarter" | "year">("week");

  // Sync component state with parent component filters
  useEffect(() => {
    if (initialFilters) {
      console.log("Updating FilterBar state with initialFilters:", initialFilters);
      setCity(initialFilters.city || null);
      setCluster(initialFilters.cluster || null);
      setManager(initialFilters.manager || null);
      setRole(initialFilters.role || null);
      setIssueType(initialFilters.issueType || null);
      setComparisonMode(initialFilters.comparisonMode || "week");
      
      if (initialFilters.dateRange) {
        setDateRange({
          from: new Date(initialFilters.dateRange.start),
          to: new Date(initialFilters.dateRange.end)
        });
      }
    }
  }, [initialFilters]);

  // Get available clusters based on selected city
  const availableClusters = city && city !== "all" && CLUSTER_OPTIONS[city] 
    ? CLUSTER_OPTIONS[city] 
    : [];

  // Apply filters
  const applyFilters = () => {
    const filters: TrendFilters = {
      city: city !== "all" ? city : null,
      cluster: cluster !== "all" ? cluster : null,
      manager: manager !== "all" ? manager : null,
      role: role !== "all" ? role : null,
      issueType: issueType !== "all" ? issueType : null,
      comparisonMode,
    };
    
    // Add date range if set
    if (dateRange?.from) {
      filters.dateRange = {
        start: format(dateRange.from, "yyyy-MM-dd"),
        end: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : format(dateRange.from, "yyyy-MM-dd")
      };
    }
    
    console.log("Applying filters:", filters);
    onFilterChange(filters);
  };

  // Handle city selection
  const handleCityChange = (value: string) => {
    console.log("City changed to:", value);
    const newCity = value === "all" ? null : value;
    setCity(newCity);
    
    // Reset cluster when city changes
    setCluster(null);
  };

  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range) {
      setDateRange(range);
      console.log("Date range changed:", range);
    }
  };

  // Helper function to format date range for display
  const formatDateRange = () => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "LLL dd, yyyy")} - ${format(dateRange.to, "LLL dd, yyyy")}`;
      }
      return format(dateRange.from, "LLL dd, yyyy");
    }
    return "Select dates";
  };

  // Helper functions for selecting preset date ranges
  const selectLastNDays = (days: number) => {
    const to = new Date();
    const from = addDays(to, -days + 1);
    setDateRange({ from, to });
  };

  // Get the appropriate select value to display, handling null values
  const getSelectValue = (value: string | null): string => {
    return value || "all";
  };

  return (
    <div className="grid grid-cols-1 gap-4 mb-6 p-4 border rounded-md bg-background">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {/* City filter */}
        <div className="space-y-1.5">
          <Label htmlFor="city-filter" className="mb-1 block">City</Label>
          <Select value={getSelectValue(city)} onValueChange={handleCityChange}>
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

        {/* Cluster filter */}
        <div className="space-y-1.5">
          <Label htmlFor="cluster-filter" className="mb-1 block">Cluster</Label>
          <Select 
            value={getSelectValue(cluster)} 
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

        {/* Manager filter */}
        <div className="space-y-1.5">
          <Label htmlFor="manager-filter" className="mb-1 block">Manager</Label>
          <Select 
            value={getSelectValue(manager)} 
            onValueChange={(value) => setManager(value === "all" ? null : value)}
          >
            <SelectTrigger id="manager-filter">
              <SelectValue placeholder="All Managers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              {managers.map((managerName) => (
                <SelectItem key={managerName} value={managerName}>
                  {managerName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Role filter */}
        <div className="space-y-1.5">
          <Label htmlFor="role-filter" className="mb-1 block">Role</Label>
          <Select 
            value={getSelectValue(role)} 
            onValueChange={(value) => setRole(value === "all" ? null : value)}
          >
            <SelectTrigger id="role-filter">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((roleName) => (
                <SelectItem key={roleName} value={roleName}>
                  {roleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Issue type filter */}
        <div className="space-y-1.5">
          <Label htmlFor="issue-type-filter" className="mb-1 block">Issue Type</Label>
          <Select 
            value={getSelectValue(issueType)} 
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

        {/* Date range picker */}
        <div className="space-y-1.5">
          <Label htmlFor="date-range-filter" className="mb-1 block">Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal" id="date-range-filter">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDateRange()}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 border-b border-gray-200 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => selectLastNDays(7)}
                >
                  Last 7 days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => selectLastNDays(30)}
                >
                  Last 30 days
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => selectLastNDays(90)}
                >
                  Last 90 days
                </Button>
              </div>
              <CalendarComponent
                mode="range"
                selected={dateRange}
                onSelect={handleDateRangeChange}
                numberOfMonths={2}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Comparison mode selector */}
      <div className="mt-4">
        <Label className="mb-1.5 block">Comparison Mode</Label>
        <div className="flex flex-wrap gap-2">
          {COMPARISON_MODES.map(mode => (
            <Button 
              key={mode.value}
              variant={comparisonMode === mode.value ? "default" : "outline"}
              size="sm"
              onClick={() => setComparisonMode(mode.value)}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Apply filters button */}
      <div className="mt-4">
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
});

TicketTrendFilterBar.displayName = 'TicketTrendFilterBar';

export default TicketTrendFilterBar;
