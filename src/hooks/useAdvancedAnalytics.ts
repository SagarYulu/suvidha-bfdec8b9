
import { useState, useEffect } from "react";
import { AdvancedFilters } from "@/components/admin/analytics/types";
import { supabase } from "@/integrations/supabase/client";

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching advanced analytics data with filters:", filters);
        
        // Start building the base query
        let query = supabase
          .from('issues')
          .select(`
            *,
            issue_comments (*)
          `);
        
        // Apply city filter
        if (filters.city) {
          console.log("Applying city filter:", filters.city);
          // Join with employees table to filter by city
          query = query.eq('city', filters.city);
        }
        
        // Apply cluster filter
        if (filters.cluster) {
          console.log("Applying cluster filter:", filters.cluster);
          query = query.eq('cluster', filters.cluster);
        }
        
        // Apply manager filter
        if (filters.manager) {
          console.log("Applying manager filter:", filters.manager);
          query = query.eq('manager', filters.manager);
        }
        
        // Apply role filter
        if (filters.role) {
          console.log("Applying role filter:", filters.role);
          query = query.eq('role', filters.role);
        }
        
        // Apply issue type filter
        if (filters.issueType) {
          console.log("Applying issue type filter:", filters.issueType);
          query = query.eq('type_id', filters.issueType);
        }
        
        // Apply date range filter
        if (filters.dateRange) {
          if (filters.dateRange.from) {
            const fromDate = new Date(filters.dateRange.from);
            console.log("Applying from date filter:", fromDate.toISOString());
            query = query.gte('created_at', fromDate.toISOString());
          }
          
          if (filters.dateRange.to) {
            const toDate = new Date(filters.dateRange.to);
            // Set time to end of day for the "to" date
            toDate.setHours(23, 59, 59, 999);
            console.log("Applying to date filter:", toDate.toISOString());
            query = query.lte('created_at', toDate.toISOString());
          }
        }
        
        console.log("Executing query with filters");
        const { data: rawIssues, error } = await query;
        
        if (error) {
          throw error;
        }
        
        console.log(`Fetched ${rawIssues?.length || 0} issues with applied filters`);
        
        // Process the data
        const processedData = {
          rawIssues,
          // Add any additional processed metrics here
          totalIssues: rawIssues?.length || 0,
          // Calculate other metrics as needed
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
