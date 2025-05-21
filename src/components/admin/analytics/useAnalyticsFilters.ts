
import { useState, useMemo } from "react";
import { AdvancedFilters, ComparisonMode } from "./types";
import { CLUSTER_OPTIONS } from "@/data/formOptions";
import { DateRange } from "./DateRangePicker";

export const useAnalyticsFilters = () => {
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
    isComparisonModeEnabled: false,
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

  const handleComparisonModeToggle = (enabled: boolean) => {
    setFilters(prev => ({ ...prev, isComparisonModeEnabled: enabled }));
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
      isComparisonModeEnabled: filters.isComparisonModeEnabled,
      comparisonMode: filters.comparisonMode,
    });
  };

  return {
    filters,
    managers,
    availableClusters,
    activeFiltersCount,
    handleCityChange,
    handleClusterChange,
    handleManagerChange,
    handleRoleChange,
    handleIssueTypeChange,
    handleDateRangeChange,
    handleComparisonModeToggle,
    handleComparisonModeChange,
    clearFilters,
  };
};

export const COMPARISON_MODES = [
  { value: "day-by-day", label: "Day-by-Day" },
  { value: "week-on-week", label: "Week-on-Week" },
  { value: "month-on-month", label: "Month-on-Month" },
  { value: "quarter-on-quarter", label: "Quarter-on-Quarter" },
  { value: "year-on-year", label: "Year-on-Year" },
];
