import { supabase } from "@/integrations/supabase/client";
import { getIssueAuditTrail } from "./issueAuditService";

// Define an interface for analytics filters
export interface AnalyticsFilters {
  employeeUuids?: string[];
  issueType?: string;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export const getAnalytics = async (filters: AnalyticsFilters = {}) => {
  try {
    console.log("Analytics filters received:", filters);
    
    // Build the query with filters
    let query = supabase.from('issues').select('*');
    
    // Apply filters if provided
    if (filters) {
      // Apply employee_uuid filter if there's city/cluster filtering
      if (filters.employeeUuids && filters.employeeUuids.length > 0) {
        query = query.in('employee_uuid', filters.employeeUuids);
      }
      
      // Apply issue type filter
      if (filters.issueType) {
        query = query.eq('type_id', filters.issueType);
      }

      // Apply date range filter if provided
      if (filters.dateRange) {
        if (filters.dateRange.start) {
          query = query.gte('created_at', filters.dateRange.start);
        }
        if (filters.dateRange.end) {
          query = query.lte('created_at', filters.dateRange.end);
        }
      }
    }
    
    // Execute the query
    const { data, error } = await query;
    
    if (error) {
      console.error("Error fetching issues:", error);
      return null;
    }
    
    console.log(`Retrieved ${data?.length || 0} issues for analytics`);
    
    // Process the data to derive insights
    const totalIssues = data.length;
    const openIssues = data.filter(issue => issue.status === 'open').length;
    const inProgressIssues = data.filter(issue => issue.status === 'in_progress').length;
    const resolvedIssues = data.filter(issue => issue.status === 'resolved').length;
    const closedIssues = data.filter(issue => issue.status === 'closed').length;
    
    // Example: Issues created per day
    const issuesPerDay = data.reduce((acc, issue) => {
      const date = new Date(issue.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    
    // Example: Issues by type - map using the correct property name (type_id)
    const issuesByType = data.reduce((acc, issue) => {
      acc[issue.type_id] = (acc[issue.type_id] || 0) + 1;
      return acc;
    }, {});
    
    // Group issues by city - use employee data to get city 
    // This is a simplified approach since we don't have direct city info on issues
    const cityCounts = data.reduce((acc, issue) => {
      // Default to 'Unknown' since we can't directly access city
      const city = 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});
    
    // Add cluster and manager counts to analytics
    const clusterCounts = data.reduce((acc, issue) => {
      const cluster = 'Unknown';
      acc[cluster] = (acc[cluster] || 0) + 1;
      return acc;
    }, {});
    
    const managerCounts = data.reduce((acc, issue) => {
      const manager = 'Unknown';
      acc[manager] = (acc[manager] || 0) + 1;
      return acc;
    }, {});
    
    // Ensure type counts match the issues by type data 
    const typeCounts = {...issuesByType};
    
    // Calculate resolution rate - include both resolved and closed issues
    const resolutionRate = totalIssues > 0 
      ? ((resolvedIssues + closedIssues) / totalIssues) * 100 
      : 0;
    
    // Add average resolution and response times
    const avgResolutionTime = await getAverageResolutionTime();
    const avgFirstResponseTime = await getAverageFirstResponseTime();
    
    return {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      issuesPerDay,
      issuesByType,
      cityCounts,
      typeCounts,
      clusterCounts,
      managerCounts,
      resolutionRate,
      avgResolutionTime,
      avgFirstResponseTime
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
      .gte('created_at', startDate)
      .lte('created_at', endDate);
    
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
      .select('created_at, closed_at')
      .not('closed_at', 'is', null);
    
    if (error) {
      console.error("Error fetching issues for resolution time calculation:", error);
      return null;
    }
    
    if (!data || data.length === 0) {
      return 0; // Return 0 if there are no resolved issues
    }
    
    // Calculate the total resolution time in milliseconds
    const totalResolutionTime = data.reduce((acc, issue) => {
      const createdAt = new Date(issue.created_at).getTime();
      const closedAt = new Date(issue.closed_at).getTime();
      return acc + (closedAt - createdAt);
    }, 0);
    
    // Calculate the average resolution time in hours
    const averageResolutionTimeMs = totalResolutionTime / data.length;
    const averageResolutionTimeHours = averageResolutionTimeMs / (1000 * 60 * 60);
    
    return Math.round(averageResolutionTimeHours * 10) / 10; // Round to 1 decimal place
  } catch (error) {
    console.error("Error in getAverageResolutionTime:", error);
    return null;
  }
};

// New function to calculate average first response time
export const getAverageFirstResponseTime = async () => {
  try {
    // This is a placeholder implementation
    // In a real implementation, you would calculate this from first comment timestamps
    return 4.5; // Return a placeholder value of 4.5 hours
  } catch (error) {
    console.error("Error in getAverageFirstResponseTime:", error);
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
export const someFunction = (issueId: string) => {
  return getIssueAuditTrail(issueId);
};

// Example function to fetch issues assigned to a specific employee
export const getIssuesAssignedToEmployee = async (employeeUuid: string) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('assigned_to', employeeUuid);

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
