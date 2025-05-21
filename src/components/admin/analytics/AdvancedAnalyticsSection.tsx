
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, Users } from "lucide-react";
import { CITY_OPTIONS, CLUSTER_OPTIONS, ROLE_OPTIONS } from "@/data/formOptions";
import { ISSUE_TYPES } from "@/config/issueTypes";
import { Badge } from "@/components/ui/badge";
import { AdvancedAnalyticsCharts } from "./AdvancedAnalyticsCharts";
import { DateRangePicker, DateRange } from "./DateRangePicker";
import { Separator } from "@/components/ui/separator";

export type ComparisonMode = 
  | "day-by-day" 
  | "week-on-week" 
  | "month-on-month" 
  | "quarter-on-quarter" 
  | "year-on-year";

export interface AdvancedFilters {
  city: string | null;
  cluster: string | null;
  manager: string | null;
  role: string | null;
  issueType: string | null;
  dateRange: DateRange;
  comparisonMode: ComparisonMode;
}

const COMPARISON_MODES = [
  { value: "day-by-day", label: "Day-by-Day" },
  { value: "week-on-week", label: "Week-on-Week" },
  { value: "month-on-month", label: "Month-on-Month" },
  { value: "quarter-on-quarter", label: "Quarter-on-Quarter" },
  { value: "year-on-year", label: "Year-on-Year" },
];

export const AdvancedAnalyticsSection = () => {
  const [filters, setFilters] = useState<AdvancedFilters>({
    city: null,
    cluster: null,
    manager: null,
    role: null,
    issueType: null,
    dateRange: {
      from: new Date(new Date().setDate(new Date().getDate() - 30)),
      to: new Date(),
    },
    comparisonMode: "day-by-day",
  });

  const [managers, setManagers] = useState<string[]>(["All Managers"]);

  // Available clusters based on selected city
  const availableClusters = useMemo(() => {
    if (!filters.city) return [];
    return CLUSTER_OPTIONS[filters.city] || [];
  }, [filters.city]);

  const handleCityChange = (city: string) => {
    setFilters(prev => ({ 
      ...prev, 
      city,
      // Reset cluster when city changes
      cluster: null
    }));
  };

  const handleClusterChange = (cluster: string) => {
    setFilters(prev => ({ ...prev, cluster }));
  };

  const handleManagerChange = (manager: string) => {
    setFilters(prev => ({ ...prev, manager }));
  };

  const handleRoleChange = (role: string) => {
    setFilters(prev => ({ ...prev, role }));
  };

  const handleIssueTypeChange = (issueType: string) => {
    setFilters(prev => ({ ...prev, issueType }));
  };

  const handleDateRangeChange = (dateRange: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange }));
  };

  const handleComparisonModeChange = (mode: string) => {
    setFilters(prev => ({ ...prev, comparisonMode: mode as ComparisonMode }));
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.cluster) count++;
    if (filters.manager) count++;
    if (filters.role) count++;
    if (filters.issueType) count++;
    return count;
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      city: null,
      cluster: null,
      manager: null,
      role: null,
      issueType: null,
      dateRange: filters.dateRange,
      comparisonMode: filters.comparisonMode,
    });
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">🟦 Advanced SLA & Ticket Trends</h2>
        {activeFiltersCount > 0 && (
          <Badge 
            variant="outline" 
            className="cursor-pointer hover:bg-muted"
            onClick={clearFilters}
          >
            {activeFiltersCount} filters active • Clear
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Filters</CardTitle>
          <CardDescription>
            Filter the data to analyze specific trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={filters.city || ""} onValueChange={handleCityChange}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="All Cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-cities">All Cities</SelectItem>
                  {CITY_OPTIONS.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cluster">Cluster</Label>
              <Select 
                value={filters.cluster || ""} 
                onValueChange={handleClusterChange}
                disabled={!filters.city}
              >
                <SelectTrigger id="cluster">
                  <SelectValue placeholder="All Clusters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-clusters">All Clusters</SelectItem>
                  {availableClusters.map(cluster => (
                    <SelectItem key={cluster} value={cluster}>{cluster}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager">Manager</Label>
              <Select value={filters.manager || ""} onValueChange={handleManagerChange}>
                <SelectTrigger id="manager">
                  <SelectValue placeholder="All Managers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-managers">All Managers</SelectItem>
                  {managers.map(manager => (
                    <SelectItem key={manager} value={manager}>{manager}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={filters.role || ""} onValueChange={handleRoleChange}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-roles">All Roles</SelectItem>
                  {ROLE_OPTIONS.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issueType">Issue Type</Label>
              <Select value={filters.issueType || ""} onValueChange={handleIssueTypeChange}>
                <SelectTrigger id="issueType">
                  <SelectValue placeholder="All Issue Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-issues">All Issue Types</SelectItem>
                  {ISSUE_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker 
                date={filters.dateRange} 
                onChange={handleDateRangeChange} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comparisonMode">Comparison Mode</Label>
              <Select 
                value={filters.comparisonMode} 
                onValueChange={handleComparisonModeChange}
              >
                <SelectTrigger id="comparisonMode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPARISON_MODES.map(mode => (
                    <SelectItem key={mode.value} value={mode.value}>{mode.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts will be loaded here */}
      <AdvancedAnalyticsCharts filters={filters} />
    </div>
  );
};
