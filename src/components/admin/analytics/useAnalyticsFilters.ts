
import { useState, useMemo, useCallback } from "react";
import { AdvancedFilters, ComparisonMode } from "./types";
import { CLUSTER_OPTIONS } from "@/data/formOptions";
import { DateRange } from "./DateRangePicker";

export const useAnalyticsFilters = () => {
  // Initial filters state
  const defaultFilters: AdvancedFilters = {
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
  };

  // State for filters that are pending application
  const [pendingFilters, setPendingFilters] = useState<AdvancedFilters>(defaultFilters);
  
  // State for filters that are currently applied
  const [appliedFilters, setAppliedFilters] = useState<AdvancedFilters>(defaultFilters);

  const [managers, setManagers] = useState<string[]>(["All Managers"]);

  // Use the applied filters for data queries
  const filters = appliedFilters;

  // Available clusters based on selected city
  const availableClusters = useMemo(() => {
    if (!pendingFilters.city) return [];
    return CLUSTER_OPTIONS[pendingFilters.city] || [];
  }, [pendingFilters.city]);

  const handleCityChange = useCallback((city: string) => {
    setPendingFilters(prev => ({ 
      ...prev, 
      city,
      // Reset cluster when city changes
      cluster: null
    }));
  }, []);

  const handleClusterChange = useCallback((cluster: string) => {
    setPendingFilters(prev => ({ ...prev, cluster }));
  }, []);

  const handleManagerChange = useCallback((manager: string) => {
    setPendingFilters(prev => ({ ...prev, manager }));
  }, []);

  const handleRoleChange = useCallback((role: string) => {
    setPendingFilters(prev => ({ ...prev, role }));
  }, []);

  const handleIssueTypeChange = useCallback((issueType: string) => {
    setPendingFilters(prev => ({ ...prev, issueType }));
  }, []);

  const handleDateRangeChange = useCallback((dateRange: DateRange) => {
    setPendingFilters(prev => ({ ...prev, dateRange }));
  }, []);

  const handleComparisonModeToggle = useCallback((enabled: boolean) => {
    setPendingFilters(prev => ({ ...prev, isComparisonModeEnabled: enabled }));
  }, []);

  const handleComparisonModeChange = useCallback((mode: string) => {
    setPendingFilters(prev => ({ ...prev, comparisonMode: mode as ComparisonMode }));
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (pendingFilters.city) count++;
    if (pendingFilters.cluster) count++;
    if (pendingFilters.manager) count++;
    if (pendingFilters.role) count++;
    if (pendingFilters.issueType) count++;
    if (pendingFilters.isComparisonModeEnabled) count++;
    return count;
  }, [pendingFilters]);

  const clearFilters = useCallback(() => {
    const clearedFilters = {
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
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  }, []);

  return {
    filters,
    pendingFilters,
    setAppliedFilters,
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
