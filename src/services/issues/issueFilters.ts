
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { processIssues } from "./issueCore";

// Define filter types
export type IssueFilters = {
  city: string | null;
  cluster: string | null;
  issueType: string | null;
};

export const getIssues = async (filters?: IssueFilters): Promise<Issue[]> => {
  try {
    console.log("getIssues called with filters:", filters);
    
    // If no filters provided or all filters are null, return all issues
    if (!filters || (!filters.city && !filters.cluster && !filters.issueType)) {
      console.log("No filters applied, fetching all issues");
      
      // Get all issues
      const { data: dbIssues, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching all issues:', error);
        return [];
      }
      
      // Process issues with comments and return
      return await processIssues(dbIssues || []);
    }
    
    // At least one filter is active, so we need to apply filtering
    let employeeIds: string[] = [];
    let shouldFilterByEmployees = false;
    
    // Only query employees if city or cluster filter is active
    if (filters.city || filters.cluster) {
      console.log("Applying city/cluster filter");
      shouldFilterByEmployees = true;
      
      // Build employee query
      let employeeQuery = supabase.from('employees').select('id');
      
      if (filters.city) {
        console.log("Filtering employees by city:", filters.city);
        employeeQuery = employeeQuery.eq('city', filters.city);
      }
      
      if (filters.cluster) {
        console.log("Filtering employees by cluster:", filters.cluster);
        employeeQuery = employeeQuery.eq('cluster', filters.cluster);
      }
      
      // Execute employee query
      const { data: employees, error: employeeError } = await employeeQuery;
      
      if (employeeError) {
        console.error('Error fetching employees for filtering:', employeeError);
        return [];
      }
      
      // Extract employee IDs from filtered employees
      employeeIds = employees?.map(emp => emp.id) || [];
      console.log(`Found ${employeeIds.length} employees matching the city/cluster filters with IDs:`, employeeIds);
      
      // If filtering by city/cluster but no matching employees found, return empty result
      if (employeeIds.length === 0) {
        console.log("No employees match the city/cluster criteria, returning empty result");
        return [];
      }
    }
    
    // Start building the issues query
    let issuesQuery = supabase
      .from('issues')
      .select('*')
      .order('created_at', { ascending: false });
    
    // Apply user_id filter if needed - this filters based on the employee ID that's stored in user_id field
    if (shouldFilterByEmployees && employeeIds.length > 0) {
      console.log("Applying user_id filter with employee IDs:", employeeIds);
      issuesQuery = issuesQuery.in('user_id', employeeIds);
    }
    
    // Filter by issue type if specified
    if (filters.issueType) {
      console.log("Filtering by issue type:", filters.issueType);
      issuesQuery = issuesQuery.eq('type_id', filters.issueType);
    }
    
    // Execute the final issues query
    const { data: dbIssues, error } = await issuesQuery;
    
    if (error) {
      console.error('Error fetching filtered issues:', error);
      return [];
    }
    
    console.log(`Found ${dbIssues?.length || 0} issues matching the filters`);
    
    // Process issues with comments and return
    return await processIssues(dbIssues || []);
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};
