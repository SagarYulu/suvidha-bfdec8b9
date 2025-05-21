
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
    comparisonMode: "day-by-day" as ComparisonMode,
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
    console.log("City changed to:", city);
    setPendingFilters(prev => ({ 
      ...prev, 
      city: city === "all-cities" ? null : city,
      // Reset cluster when city changes
      cluster: null
    }));
  }, []);

  const handleClusterChange = useCallback((cluster: string) => {
    console.log("Cluster changed to:", cluster);
    setPendingFilters(prev => ({ 
      ...prev, 
      cluster: cluster === "all-clusters" ? null : cluster 
    }));
  }, []);

  const handleManagerChange = useCallback((manager: string) => {
    console.log("Manager changed to:", manager);
    setPendingFilters(prev => ({ 
      ...prev, 
      manager: manager === "all-managers" ? null : manager 
    }));
  }, []);

  const handleRoleChange = useCallback((role: string) => {
    console.log("Role changed to:", role);
    setPendingFilters(prev => ({ 
      ...prev, 
      role: role === "all-roles" ? null : role 
    }));
  }, []);

  const handleIssueTypeChange = useCallback((issueType: string) => {
    console.log("Issue type changed to:", issueType);
    setPendingFilters(prev => ({ 
      ...prev, 
      issueType: issueType === "all-issues" ? null : issueType 
    }));
  }, []);

  const handleDateRangeChange = useCallback((dateRange: DateRange) => {
    console.log("Date range changed:", dateRange);
    setPendingFilters(prev => ({ ...prev, dateRange }));
  }, []);

  const handleComparisonModeToggle = useCallback((enabled: boolean) => {
    console.log("Comparison mode toggled:", enabled);
    setPendingFilters(prev => ({ ...prev, isComparisonModeEnabled: enabled }));
  }, []);

  const handleComparisonModeChange = useCallback((mode: string) => {
    console.log("Comparison mode changed:", mode);
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
    console.log("Clearing all filters");
    const clearedFilters: AdvancedFilters = {
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
      comparisonMode: "day-by-day" as ComparisonMode,
    };
    setPendingFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
  }, []);
  
  // Apply pending filters
  const applyFilters = useCallback(() => {
    console.log("Applying filters:", pendingFilters);
    setAppliedFilters({ ...pendingFilters });
  }, [pendingFilters]);

  return {
    filters,
    pendingFilters,
    setAppliedFilters,
    applyFilters,
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
