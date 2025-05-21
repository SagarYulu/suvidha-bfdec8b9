
import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { AdvancedFilters, ComparisonMode } from "./types";
import { CITY_OPTIONS, CLUSTER_OPTIONS } from "@/data/formOptions";
import { DateRange } from "./DateRangePicker";
import { supabase } from "@/integrations/supabase/client";

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

  const [managers, setManagers] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isMounted = useRef(true);

  // Track if component is mounted to prevent state updates after unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Fetch managers on component mount - only once
  useEffect(() => {
    const fetchManagers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('employees')
          .select('manager')
          .not('manager', 'is', null);
        
        if (error) {
          console.error('Error fetching managers:', error);
          return;
        }

        // Only update state if component is still mounted
        if (isMounted.current) {
          // Extract unique manager names
          const uniqueManagers = Array.from(new Set(
            data
              .map(item => item.manager)
              .filter(Boolean) // Remove null/undefined values
          ));
          
          setManagers(uniqueManagers as string[]);
        }
      } catch (error) {
        console.error('Error in fetchManagers:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchManagers();
  }, []);

  // Available clusters based on selected city
  const availableClusters = useMemo(() => {
    if (!filters.city) return [];
    return CLUSTER_OPTIONS[filters.city] || [];
  }, [filters.city]);

  // Use useCallback to memoize handler functions
  const handleCityChange = useCallback((city: string) => {
    setFilters(prev => ({ 
      ...prev, 
      city: city === "all-cities" ? null : city,
      // Reset cluster when city changes
      cluster: null
    }));
  }, []);

  const handleClusterChange = useCallback((cluster: string) => {
    setFilters(prev => ({ 
      ...prev, 
      cluster: cluster === "all-clusters" ? null : cluster 
    }));
  }, []);

  const handleManagerChange = useCallback((manager: string) => {
    setFilters(prev => ({ 
      ...prev, 
      manager: manager === "all-managers" ? null : manager 
    }));
  }, []);

  const handleRoleChange = useCallback((role: string) => {
    setFilters(prev => ({ 
      ...prev, 
      role: role === "all-roles" ? null : role 
    }));
  }, []);

  const handleIssueTypeChange = useCallback((issueType: string) => {
    setFilters(prev => ({ 
      ...prev, 
      issueType: issueType === "all-issues" ? null : issueType 
    }));
  }, []);

  const handleDateRangeChange = useCallback((dateRange: DateRange) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);

  const handleComparisonModeToggle = useCallback((enabled: boolean) => {
    setFilters(prev => ({ ...prev, isComparisonModeEnabled: enabled }));
  }, []);

  const handleComparisonModeChange = useCallback((mode: string) => {
    setFilters(prev => ({ ...prev, comparisonMode: mode as ComparisonMode }));
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.city) count++;
    if (filters.cluster) count++;
    if (filters.manager) count++;
    if (filters.role) count++;
    if (filters.issueType) count++;
    return count;
  }, [filters.city, filters.cluster, filters.manager, filters.role, filters.issueType]);

  const clearFilters = useCallback(() => {
    setFilters(prev => ({
      city: null,
      cluster: null,
      manager: null,
      role: null,
      issueType: null,
      dateRange: prev.dateRange,
      isComparisonModeEnabled: prev.isComparisonModeEnabled,
      comparisonMode: prev.comparisonMode,
    }));
  }, []);

  return {
    filters,
    managers,
    loading,
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
