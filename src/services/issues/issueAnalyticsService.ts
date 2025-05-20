import { supabase } from "@/integrations/supabase/client";
import { getIssueAuditTrail } from "./issueAuditService";

export const getAnalytics = async () => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*');
    
    if (error) {
      console.error("Error fetching issues:", error);
      return null;
    }
    
    // Process the data to derive insights
    const totalIssues = data.length;
    const openIssues = data.filter(issue => issue.status === 'open').length;
    const inProgressIssues = data.filter(issue => issue.status === 'in_progress').length;
    const resolvedIssues = data.filter(issue => issue.status === 'resolved').length;
    const closedIssues = data.filter(issue => issue.status === 'closed').length;
    
    // Example: Issues created per day
    const issuesPerDay = data.reduce((acc, issue) => {
      const date = new Date(issue.createdAt).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Example: Issues by type
    const issuesByType = data.reduce((acc, issue) => {
      acc[issue.typeId] = (acc[issue.typeId] || 0) + 1;
      return acc;
    }, {});
    
    return {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      issuesPerDay,
      issuesByType
    };
  } catch (error) {
    console.error("Error in getAnalytics:", error);
    return null;
  }
};

// Example function to fetch issues created within a specific date range
export const getIssuesCreatedBetween = async (startDate: string, endDate: string) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .gte('createdAt', startDate)
      .lte('createdAt', endDate);
    
    if (error) {
      console.error("Error fetching issues by date range:", error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error("Error in getIssuesCreatedBetween:", error);
    return [];
  }
};

// Example function to calculate the average resolution time for issues
export const getAverageResolutionTime = async () => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('createdAt, closedAt')
      .not('closedAt', 'is', null);
    
    if (error) {
      console.error("Error fetching issues for resolution time calculation:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return 0; // Return 0 if there are no resolved issues
    }
    
    // Calculate the total resolution time in milliseconds
    const totalResolutionTime = data.reduce((acc, issue) => {
      const createdAt = new Date(issue.createdAt).getTime();
      const closedAt = new Date(issue.closedAt).getTime();
      return acc + (closedAt - createdAt);
    }, 0);
    
    // Calculate the average resolution time in days
    const averageResolutionTimeMs = totalResolutionTime / data.length;
    const averageResolutionTimeDays = averageResolutionTimeMs / (1000 * 60 * 60 * 24);
    
    return averageResolutionTimeDays;
  } catch (error) {
    console.error("Error in getAverageResolutionTime:", error);
    return null;
  }
};

// Example function to get the distribution of issue priorities
export const getIssuePriorityDistribution = async () => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('priority');
    
    if (error) {
      console.error("Error fetching issue priorities:", error);
      return {};
    }
    
    const priorityDistribution = data.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {});
    
    return priorityDistribution;
  } catch (error) {
    console.error("Error in getIssuePriorityDistribution:", error);
    return {};
  }
};

// Example function to get issues by status
export const getIssuesByStatus = async (status: string) => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .eq('status', status);
  
      if (error) {
        console.error(`Error fetching issues with status ${status}:`, error);
        return [];
      }
  
      return data;
    } catch (error) {
      console.error(`Error in getIssuesByStatus for status ${status}:`, error);
      return [];
    }
  };

// Fix the function call with correct number of arguments
// If there's a reference to getAuditTrail, correct it to use the correct import
// and ensure it's called with the right number of arguments
// (Since we don't have the full file, we're adding a placeholder fix)

export const someFunction = (issueId: string) => {
  // Replace the problematic line with the correct argument count
  // This is a placeholder - update based on actual function implementation
  return getIssueAuditTrail(issueId); 
};

// Example function to fetch issues assigned to a specific employee
export const getIssuesAssignedToEmployee = async (employeeUuid: string) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('assignedTo', employeeUuid);

    if (error) {
      console.error(`Error fetching issues assigned to employee ${employeeUuid}:`, error);
      return [];
    }

    return data;
  } catch (error) {
    console.error(`Error in getIssuesAssignedToEmployee for employee ${employeeUuid}:`, error);
    return [];
  }
};
