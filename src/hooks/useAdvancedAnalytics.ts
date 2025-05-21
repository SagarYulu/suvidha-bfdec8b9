
import { useState, useEffect } from 'react';
import { AdvancedFilters } from '@/components/admin/analytics/types';
import { supabase } from '@/integrations/supabase/client';

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        console.log("Fetching advanced analytics data with filters:", filters);
        
        // Start building the query
        let query = supabase.from('issues').select('*');
        
        // Apply city filter via employees join if needed
        if (filters.city) {
          // This requires a more complex join with employees table
          console.log("Filtering by city:", filters.city);
          
          // First, get employee IDs for the specified city
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('city', filters.city);
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            // Use these IDs to filter issues
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            // No employees found for this city
            console.log("No employees found for city:", filters.city);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply cluster filter via employees join if needed
        if (filters.cluster) {
          console.log("Filtering by cluster:", filters.cluster);
          
          // Get employee IDs for the specified cluster
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('cluster', filters.cluster);
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            // Use these IDs to filter issues
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            // No employees found for this cluster
            console.log("No employees found for cluster:", filters.cluster);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply manager filter via employees join if needed
        if (filters.manager) {
          console.log("Filtering by manager:", filters.manager);
          
          // First, get employee IDs for the specified manager
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('manager', filters.manager);
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            // Use these IDs to filter issues
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            // No employees found for this manager
            console.log("No employees found for manager:", filters.manager);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply role filter via employees join if needed
        if (filters.role) {
          console.log("Filtering by role:", filters.role);
          
          // Get employee IDs for the specified role
          const { data: employeeIds, error: empError } = await supabase
            .from('employees')
            .select('id')
            .eq('role', filters.role);
          
          if (empError) throw empError;
          
          if (employeeIds && employeeIds.length > 0) {
            // Use these IDs to filter issues
            const employeeUuids = employeeIds.map(e => e.id);
            query = query.in('employee_uuid', employeeUuids);
          } else {
            // No employees found for this role
            console.log("No employees found for role:", filters.role);
            setData({ rawIssues: [] });
            setIsLoading(false);
            return;
          }
        }
        
        // Apply issue type filter directly
        if (filters.issueType) {
          console.log("Filtering by issue type:", filters.issueType);
          query = query.eq('type_id', filters.issueType);
        }
        
        // Apply date range filter
        if (filters.dateRange && filters.dateRange.from) {
          console.log("Filtering by date from:", filters.dateRange.from);
          query = query.gte('created_at', filters.dateRange.from.toISOString());
        }
        
        if (filters.dateRange && filters.dateRange.to) {
          console.log("Filtering by date to:", filters.dateRange.to);
          query = query.lte('created_at', filters.dateRange.to.toISOString());
        }
        
        // Execute the query
        const { data: issues, error: issuesError } = await query;
        
        if (issuesError) throw issuesError;
        
        console.log(`Found ${issues?.length || 0} issues matching the filters`);
        
        // For each issue, fetch its comments
        let issuesWithComments = [];
        if (issues) {
          for (const issue of issues) {
            const { data: comments, error: commentsError } = await supabase
              .from('issue_comments')
              .select('*')
              .eq('issue_id', issue.id);
            
            if (commentsError) {
              console.warn(`Error fetching comments for issue ${issue.id}:`, commentsError);
            }
            
            issuesWithComments.push({
              ...issue,
              issue_comments: comments || []
            });
          }
        }
        
        // Process the data if needed
        setData({
          rawIssues: issuesWithComments,
          // Add any derived metrics here if needed
        });
      } catch (err: any) {
        console.error("Error in useAdvancedAnalytics:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [filters]); // Re-fetch when filters change

  return { data, isLoading, error };
};
