
import { useQuery } from "@tanstack/react-query";
import { getIssues } from "@/services/issues/issueFilters";
import { getAnalytics } from "@/services/issues/issueAnalyticsService";

// Define the type for our issue stats
export interface IssueStats {
  totalIssues: number;
  openIssues: number;
  avgFirstResponseTime: number;
  resolvedIssues: number;
  highPriorityIssues: number;
}

// Function to get issue stats
export const getIssueStats = async (): Promise<IssueStats> => {
  try {
    // Fetch issues and analytics from existing services
    const issues = await getIssues({});
    const analytics = await getAnalytics({});
    
    // Calculate open issues
    const open = issues.filter(issue => 
      issue.status === "open" || issue.status === "in_progress"
    ).length;
    
    // Return the stats
    return {
      totalIssues: issues.length,
      openIssues: open,
      avgFirstResponseTime: analytics?.averageFRT || 0,
      resolvedIssues: issues.filter(issue => issue.status === "closed").length,
      highPriorityIssues: issues.filter(issue => issue.priority === "high").length
    };
  } catch (error) {
    console.error("Error getting issue stats:", error);
    // Return fallback values if there's an error
    return {
      totalIssues: 0,
      openIssues: 0,
      avgFirstResponseTime: 0,
      resolvedIssues: 0,
      highPriorityIssues: 0
    };
  }
};
