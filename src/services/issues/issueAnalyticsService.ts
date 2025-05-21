import { Issue, IssueAnalytics } from "@/types";
import { format, subDays, parseISO } from "date-fns";
import { getIssues } from "./issueFetchService";
import { getIssueTypeLabel, getIssueSubtypeLabel } from "./issueTypeHelpers";

export interface IssueAnalyticsResponse extends IssueAnalytics {
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
function calculateBaseAnalytics(issues: Issue[]): IssueAnalytics {
  const issuesByType: { [key: string]: number } = {};
  const issuesByCity: { [key: string]: number } = {};

  issues.forEach(issue => {
    const typeLabel = getIssueTypeLabel(issue.typeId) || 'Unknown Type';
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

export default {
  getIssueAnalytics,
};
