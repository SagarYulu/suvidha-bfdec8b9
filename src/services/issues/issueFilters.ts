
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
    let query = supabase
      .from('issues')
      .select('*, employees!inner(*)')
      .order('created_at', { ascending: false });
    
    // Filter by city if specified
    if (filters.city) {
      console.log("Filtering by city:", filters.city);
      query = query.eq('employees.city', filters.city);
    }
    
    // Filter by cluster if specified
    if (filters.cluster) {
      console.log("Filtering by cluster:", filters.cluster);
      query = query.eq('employees.cluster', filters.cluster);
    }
    
    // Filter by issue type if specified
    if (filters.issueType) {
      console.log("Filtering by issue type:", filters.issueType);
      query = query.eq('type_id', filters.issueType);
    }
    
    // Execute the query
    const { data: dbIssues, error } = await query;
    
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
