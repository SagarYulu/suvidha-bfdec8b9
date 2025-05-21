
import { useState, useEffect } from "react";
import { AdvancedFilters } from "@/components/admin/analytics/types";
import { supabase } from "@/integrations/supabase/client";
import { PostgrestFilterBuilder } from "@supabase/supabase-js";

interface AdvancedAnalyticsData {
  rawIssues: any[];
  totalIssues: number;
  // Add more specific properties as needed
}

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching advanced analytics data with filters:", filters);
        
        // Create the base query
        const query = supabase.from('issues').select(`
          *,
          issue_comments (*)
        `);
        
        // Apply filters individually to avoid excessive chaining
        let filteredQuery = query;
        
        if (filters.city) {
          console.log("Adding city filter:", filters.city);
          filteredQuery = filteredQuery.eq('city', filters.city);
        }
        
        if (filters.cluster) {
          console.log("Adding cluster filter:", filters.cluster);
          filteredQuery = filteredQuery.eq('cluster', filters.cluster);
        }
        
        if (filters.manager) {
          console.log("Adding manager filter:", filters.manager);
          filteredQuery = filteredQuery.eq('manager', filters.manager);
        }
        
        if (filters.role) {
          console.log("Adding role filter:", filters.role);
          filteredQuery = filteredQuery.eq('role', filters.role);
        }
        
        if (filters.issueType) {
          console.log("Adding issue type filter:", filters.issueType);
          filteredQuery = filteredQuery.eq('type_id', filters.issueType);
        }
        
        // Apply date range filter 
        if (filters.dateRange) {
          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            console.log("Applying from date filter:", fromDate.toISOString());
            filteredQuery = filteredQuery.gte('created_at', fromDate.toISOString());
          }
          
          if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            // Set time to end of day for the "to" date
            toDate.setHours(23, 59, 59, 999);
            console.log("Applying to date filter:", toDate.toISOString());
            filteredQuery = filteredQuery.lte('created_at', toDate.toISOString());
          }
        }
        
        console.log("Executing query with filters");
        const { data: rawIssues, error: queryError } = await filteredQuery;
        
        if (queryError) {
          throw queryError;
        }
        
        console.log(`Fetched ${rawIssues?.length || 0} issues with applied filters`);
        
        // Process the data
        const processedData: AdvancedAnalyticsData = {
          rawIssues: rawIssues || [],
          totalIssues: rawIssues?.length || 0,
        };
        
        setData(processedData);
      } catch (err) {
        console.error("Error fetching advanced analytics data:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  return {
    isLoading,
    error,
    data,
  };
};
