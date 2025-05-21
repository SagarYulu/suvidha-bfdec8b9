
import { Issue } from "@/types";
import { format, subDays, parseISO } from "date-fns";
import { getIssues } from "./issueFilters"; // Changed from issueFetchService to issueFilters
import { getIssueTypeLabel, getIssueSubTypeLabel } from "./issueTypeHelpers"; // Fixed the function name

export interface AnalyticsFilters {
  issueType?: string;
  employeeUuids?: string[];
}

// Define IssueAnalytics interface that was missing
export interface IssueAnalyticsResponse {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  highPriorityIssues: number;
  issuesByType: { [key: string]: number };
  issuesByCity: { [key: string]: number };
  volumeTrend: Array<{
    date: string;
    count: number;
  }>;
  resolutionTimeTrend: Array<{
    date: string;
    avgResolutionHours: number;
  }>;
  typeDistributionTrend: Array<{
    date: string;
    [key: string]: number | string;
  }>;
}

export async function getIssueAnalytics(timeRange: '7days' | '30days' | '90days' = '30days'): Promise<IssueAnalyticsResponse> {
  try {
    console.log(`Fetching issue analytics for ${timeRange}`);
    const days = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : 90;
    
    // Fetch all issues
    const issues = await getIssues();
    
    if (!issues || !issues.length) {
      console.error("No issues found");
      throw new Error("Failed to fetch issues");
    }
    
    // Base analytics
    const analytics = calculateBaseAnalytics(issues);
    
    // Generate trends data
    const volumeTrend = generateVolumeTrend(issues, days);
    const resolutionTimeTrend = generateResolutionTimeTrend(issues, days);
    const typeDistributionTrend = generateTypeDistributionTrend(issues, days);
    
    console.log(`Generated analytics with ${volumeTrend.length} trend points`);
    
    return {
      ...analytics,
      volumeTrend,
      resolutionTimeTrend,
      typeDistributionTrend,
    };
  } catch (error) {
    console.error("Error fetching issue analytics:", error);
    throw error;
  }
}

// Calculate basic analytics from issues
function calculateBaseAnalytics(issues: Issue[]): {
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  highPriorityIssues: number;
  issuesByType: { [key: string]: number };
  issuesByCity: { [key: string]: number };
} {
  const issuesByType: { [key: string]: number } = {};
  const issuesByCity: { [key: string]: number } = {};

  issues.forEach(issue => {
    const typeLabel = getIssueTypeLabel(issue.typeId) || 'Unknown Type';
    // Use optional chaining to safely access the city property
    const city = issue.city || 'Unknown City';

    issuesByType[typeLabel] = (issuesByType[typeLabel] || 0) + 1;
    issuesByCity[city] = (issuesByCity[city] || 0) + 1;
  });
  
  return {
    totalIssues: issues.length,
    openIssues: issues.filter(i => i.status === 'open').length,
    resolvedIssues: issues.filter(i => i.status === 'resolved').length,
    inProgressIssues: issues.filter(i => i.status === 'in_progress').length,
    highPriorityIssues: issues.filter(i => i.priority === 'high').length,
    issuesByType: issuesByType,
    issuesByCity: issuesByCity,
  };
}

// Generate ticket volume trend data
function generateVolumeTrend(issues: Issue[], days: number): Array<{ date: string; count: number }> {
  const result = [];
  const today = new Date();
  
  // Create a map to count issues by date
  const issuesByDate = new Map<string, number>();
  
  // Initialize all dates in the range with 0 count
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    issuesByDate.set(dateStr, 0);
  }
  
  // Count issues for each date
  for (const issue of issues) {
    try {
      const createdAt = parseISO(issue.createdAt);
      if (createdAt >= subDays(today, days)) {
        const dateStr = format(createdAt, 'yyyy-MM-dd');
        issuesByDate.set(dateStr, (issuesByDate.get(dateStr) || 0) + 1);
      }
    } catch (e) {
      console.error("Error parsing date:", e);
    }
  }
  
  // Convert map to array
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    result.push({
      date: dateStr,
      count: issuesByDate.get(dateStr) || 0,
    });
  }
  
  return result;
}

// Generate resolution time trend data
function generateResolutionTimeTrend(issues: Issue[], days: number): Array<{ date: string; avgResolutionHours: number }> {
  const result = [];
  const today = new Date();
  
  // Create map of issues by date with resolution times
  const resolutionTimesByDate = new Map<string, number[]>();
  
  // Initialize all dates
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    resolutionTimesByDate.set(dateStr, []);
  }
  
  // Calculate resolution times
  for (const issue of issues) {
    if (issue.status === 'resolved' && issue.createdAt && issue.updatedAt) {
      try {
        const createdAt = parseISO(issue.createdAt);
        const updatedAt = parseISO(issue.updatedAt);
        
        // Only include issues updated within the time range
        if (updatedAt >= subDays(today, days)) {
          const dateStr = format(updatedAt, 'yyyy-MM-dd');
          
          // Calculate resolution time in hours
          const resolutionTime = (updatedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          
          const times = resolutionTimesByDate.get(dateStr) || [];
          times.push(resolutionTime);
          resolutionTimesByDate.set(dateStr, times);
        }
      } catch (e) {
        console.error("Error parsing dates:", e);
      }
    }
  }
  
  // Calculate average resolution times
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const times = resolutionTimesByDate.get(dateStr) || [];
    
    const avgResolutionHours = times.length > 0
      ? Math.round((times.reduce((sum, time) => sum + time, 0) / times.length) * 10) / 10
      : 0;
    
    result.push({
      date: dateStr,
      avgResolutionHours,
    });
  }
  
  return result;
}

// Generate type distribution trend data
function generateTypeDistributionTrend(issues: Issue[], days: number): Array<{ date: string; [key: string]: number | string }> {
  const result = [];
  const today = new Date();
  
  // Get all unique issue types
  const issueTypes = new Set<string>();
  issues.forEach(issue => {
    if (issue.typeId) {
      issueTypes.add(getIssueTypeLabel(issue.typeId) || issue.typeId);
    }
  });
  
  // Create a structure for each day
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(today, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const dayData: { date: string; [key: string]: number | string } = { date: dateStr };
    
    // Initialize all issue types with 0
    issueTypes.forEach(type => {
      dayData[type] = 0;
    });
    
    // Count issues by type for this day
    for (const issue of issues) {
      try {
        const createdAt = parseISO(issue.createdAt);
        if (format(createdAt, 'yyyy-MM-dd') === dateStr) {
          const typeLabel = getIssueTypeLabel(issue.typeId) || issue.typeId;
          dayData[typeLabel] = (dayData[typeLabel] as number) + 1;
        }
      } catch (e) {
        console.error("Error parsing date:", e);
      }
    }
    
    result.push(dayData);
  }
  
  return result;
}

// Add getAnalytics function - fixed by making it async
export async function getAnalytics(filters?: AnalyticsFilters): Promise<{
  totalIssues: number;
  openIssues: number;
  resolvedIssues: number;
  inProgressIssues: number;
  highPriorityIssues: number;
  issuesByType: { [key: string]: number };
  issuesByCity: { [key: string]: number };
  typeCounts: { [key: string]: number };
  cityCounts: { [key: string]: number };
  clusterCounts: { [key: string]: number };
  managerCounts: { [key: string]: number };
  resolutionRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
}> {
  try {
    // Fetch all issues
    const issues = await getIssues();
    
    // Filter issues if filters are provided
    let filteredIssues = [...issues];
    if (filters) {
      if (filters.issueType) {
        filteredIssues = filteredIssues.filter(issue => issue.typeId === filters.issueType);
      }
      if (filters.employeeUuids && filters.employeeUuids.length > 0) {
        filteredIssues = filteredIssues.filter(issue => 
          filters.employeeUuids?.includes(issue.employeeUuid)
        );
      }
    }
    
    // Calculate base analytics
    const baseAnalytics = calculateBaseAnalytics(filteredIssues);
    
    // Calculate additional metrics
    const typeCounts: { [key: string]: number } = {};
    const cityCounts: { [key: string]: number } = {};
    const clusterCounts: { [key: string]: number } = {};
    const managerCounts: { [key: string]: number } = {};
    
    // Calculate resolution rate
    const totalIssues = filteredIssues.length;
    const resolvedIssues = filteredIssues.filter(issue => 
      issue.status === 'resolved' || issue.status === 'closed'
    ).length;
    const resolutionRate = totalIssues > 0 
      ? (resolvedIssues / totalIssues) * 100 
      : 0;
    
    // Calculate average resolution time (in hours)
    let totalResolutionTime = 0;
    let resolvedCount = 0;
    
    // Calculate average first response time (in hours)
    let totalFirstResponseTime = 0;
    let respondedCount = 0;
    
    filteredIssues.forEach(issue => {
      // Process issue types
      const typeLabel = getIssueTypeLabel(issue.typeId);
      typeCounts[typeLabel] = (typeCounts[typeLabel] || 0) + 1;
      
      // Process cities
      if (issue.city) {
        cityCounts[issue.city] = (cityCounts[issue.city] || 0) + 1;
      }
      
      // For now, we don't have cluster and manager directly on issues
      // This is just a placeholder for future implementation
      const clusterLabel = "All Clusters";
      const managerLabel = "All Managers";
      clusterCounts[clusterLabel] = (clusterCounts[clusterLabel] || 0) + 1;
      managerCounts[managerLabel] = (managerCounts[managerLabel] || 0) + 1;
      
      // Calculate resolution time for resolved issues
      if ((issue.status === 'resolved' || issue.status === 'closed') && issue.createdAt && issue.updatedAt) {
        const createdAt = new Date(issue.createdAt);
        const resolvedAt = new Date(issue.updatedAt);
        const resolutionHours = (resolvedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        totalResolutionTime += resolutionHours;
        resolvedCount++;
      }
      
      // For first response time, check if there are any comments
      if (issue.comments && issue.comments.length > 0 && issue.createdAt) {
        const createdAt = new Date(issue.createdAt);
        const firstComment = issue.comments[0];
        const firstResponseAt = new Date(firstComment.createdAt);
        const responseHours = (firstResponseAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        totalFirstResponseTime += responseHours;
        respondedCount++;
      }
    });
    
    const avgResolutionTime = resolvedCount > 0 
      ? Math.round((totalResolutionTime / resolvedCount) * 10) / 10 
      : 0;
      
    const avgFirstResponseTime = respondedCount > 0 
      ? Math.round((totalFirstResponseTime / respondedCount) * 10) / 10 
      : 0;
    
    return {
      ...baseAnalytics,
      typeCounts,
      cityCounts,
      clusterCounts,
      managerCounts,
      resolutionRate,
      avgResolutionTime,
      avgFirstResponseTime
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    throw error;
  }
}

export default {
  getIssueAnalytics,
  getAnalytics
};
