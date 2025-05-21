
import { useState, useEffect, useMemo } from 'react';
import { AdvancedFilters } from '@/components/admin/analytics/types';
import { supabase } from '@/integrations/supabase/client';

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoize the filter values to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => {
    return {
      city: filters.city,
      cluster: filters.cluster,
      manager: filters.manager,
      role: filters.role,
      issueType: filters.issueType,
      dateFrom: filters.dateRange?.from instanceof Date 
        ? filters.dateRange.from.toISOString()
        : filters.dateRange?.from,
      dateTo: filters.dateRange?.to instanceof Date
        ? filters.dateRange.to.toISOString()
        : filters.dateRange?.to,
      isComparisonModeEnabled: filters.isComparisonModeEnabled,
      comparisonMode: filters.comparisonMode
    };
  }, [
    filters.city,
    filters.cluster,
    filters.manager,
    filters.role,
    filters.issueType,
    filters.dateRange?.from,
    filters.dateRange?.to,
    filters.isComparisonModeEnabled,
    filters.comparisonMode
  ]);

  useEffect(() => {
    // Create an abort controller to handle component unmount
    const abortController = new AbortController();
    
    const fetchData = async () => {
      // Don't set loading to true if we're already loading
      // This prevents flickering when filters change rapidly
      if (!isLoading) {
        setIsLoading(true);
      }
      
      setError(null);
      
      try {
        console.log("Fetching advanced analytics data with filters:", memoizedFilters);
        
        // Start building the query
        let query = supabase.from('issues').select('*');
        
        // Apply city filter via employees join if needed
        if (memoizedFilters.city) {
          console.log("Filtering by city:", memoizedFilters.city);
          
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('city', memoizedFilters.city)
            .abortSignal(abortController.signal);
          
          if (abortController.signal.aborted) return;
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            console.log("No employees found for city:", memoizedFilters.city);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply cluster filter via employees join if needed
        if (memoizedFilters.cluster) {
          console.log("Filtering by cluster:", memoizedFilters.cluster);
          
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('cluster', memoizedFilters.cluster)
            .abortSignal(abortController.signal);
          
          if (abortController.signal.aborted) return;
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            console.log("No employees found for cluster:", memoizedFilters.cluster);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply manager filter via employees join if needed
        if (memoizedFilters.manager) {
          console.log("Filtering by manager:", memoizedFilters.manager);
          
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('manager', memoizedFilters.manager)
            .abortSignal(abortController.signal);
          
          if (abortController.signal.aborted) return;
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            console.log("No employees found for manager:", memoizedFilters.manager);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply role filter via employees join if needed
        if (memoizedFilters.role) {
          console.log("Filtering by role:", memoizedFilters.role);
          
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('role', memoizedFilters.role)
            .abortSignal(abortController.signal);
          
          if (abortController.signal.aborted) return;
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            console.log("No employees found for role:", memoizedFilters.role);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply issue type filter directly
        if (memoizedFilters.issueType) {
          console.log("Filtering by issue type:", memoizedFilters.issueType);
          query = query.eq('type_id', memoizedFilters.issueType);
        }
        
        // Apply date range filter
        if (memoizedFilters.dateFrom) {
          console.log("Filtering by date from:", memoizedFilters.dateFrom);
          query = query.gte('created_at', memoizedFilters.dateFrom);
        }
        
        if (memoizedFilters.dateTo) {
          console.log("Filtering by date to:", memoizedFilters.dateTo);
          query = query.lte('created_at', memoizedFilters.dateTo);
        }
        
        // Execute the query with abort signal
        const { data: issues, error: issuesError } = await query
          .abortSignal(abortController.signal);
        
        if (abortController.signal.aborted) return;
        
        if (issuesError) throw issuesError;
        
        console.log(`Found ${issues?.length || 0} issues matching the filters`);
        
        // For each issue, fetch its comments - using Promise.all for parallel requests
        let issuesWithComments = [];
        
        if (issues && Array.isArray(issues)) {
          const commentsPromises = issues.map(async (issue) => {
            const { data: comments, error: commentsError } = await supabase
              .from('issue_comments')
              .select('*')
              .eq('issue_id', issue.id)
              .abortSignal(abortController.signal);
            
            if (commentsError) {
              console.warn(`Error fetching comments for issue ${issue.id}:`, commentsError);
              return {
                ...issue,
                issue_comments: []
              };
            }
            
            return {
              ...issue,
              issue_comments: comments || []
            };
          });
          
          // Wait for all comments to be fetched
          if (!abortController.signal.aborted) {
            issuesWithComments = await Promise.all(commentsPromises);
          }
        }
        
        if (!abortController.signal.aborted) {
          // Process the data
          setData({
            rawIssues: issuesWithComments,
            // Add any derived metrics here if needed
          });
        }
      } catch (err: any) {
        console.error("Error in useAdvancedAnalytics:", err);
        if (!abortController.signal.aborted) {
          setError(err);
          setData({rawIssues: []});
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function that aborts any in-flight requests when component unmounts
    return () => {
      abortController.abort();
    };
  }, [
    memoizedFilters
  ]); // Only re-run when memoized filters change

  return { data, isLoading, error };
};
