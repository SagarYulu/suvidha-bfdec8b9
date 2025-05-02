
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "@/services/userService";
import { IssueFilters } from "./issueService";
import { getIssues } from "./issueService";
import { getAuditTrail } from "./issueAuditService";
import { Issue } from "@/types";

export const getAnalytics = async (filters?: IssueFilters, preloadedIssues?: Issue[]) => {
  try {
    // Use preloaded issues if available, otherwise fetch them
    const issues = preloadedIssues || await getIssues(filters);
    
    if (issues.length === 0) {
      return {
        totalIssues: 0,
        resolvedIssues: 0,
        openIssues: 0,
        resolutionRate: 0,
        avgResolutionTime: '0',
        cityCounts: {},
        clusterCounts: {},
        managerCounts: {},
        typeCounts: {},
      };
    }
    
    console.log(`Analytics processing ${issues.length} issues with filters:`, filters);
    
    // Calculate various analytics based on the issues data
    const totalIssues = issues.length;
    const resolvedIssues = issues.filter(i => i.status === "closed" || i.status === "resolved").length;
    const openIssues = totalIssues - resolvedIssues;
    
    // Average resolution time (for closed issues)
    const closedIssues = issues.filter(i => i.closedAt);
    let avgResolutionTime = 0;
    
    if (closedIssues.length > 0) {
      const totalResolutionTime = closedIssues.reduce((total, issue) => {
        const createdDate = new Date(issue.createdAt);
        const closedDate = new Date(issue.closedAt!);
        const timeDiff = closedDate.getTime() - createdDate.getTime();
        return total + timeDiff;
      }, 0);
      
      avgResolutionTime = totalResolutionTime / closedIssues.length / (1000 * 60 * 60); // hours
    }
    
    // Fetch user data to correctly map city/cluster information
    const users = await getUsers();
    
    // City-wise issues
    const cityCounts: Record<string, number> = {};
    // Cluster-wise issues
    const clusterCounts: Record<string, number> = {};
    // Manager-wise issues - fixed to use real user data
    const managerCounts: Record<string, number> = {};
    // Issue type distribution
    const typeCounts: Record<string, number> = {};
    
    // Process each issue and map it to the correct user data
    for (const issue of issues) {
      // Find the user who created this issue
      const user = users.find(u => u.id === issue.userId);
      
      if (user) {
        // Use actual user data for analytics
        const city = user.city || "Unknown";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        
        const cluster = user.cluster || "Unknown";
        clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
        
        // Use the actual manager name from user data
        const manager = user.manager || "Unassigned";
        managerCounts[manager] = (managerCounts[manager] || 0) + 1;
      } else {
        // Fallback for issues without valid user data
        cityCounts["Unknown"] = (cityCounts["Unknown"] || 0) + 1;
        clusterCounts["Unknown"] = (clusterCounts["Unknown"] || 0) + 1;
        managerCounts["Unassigned"] = (managerCounts["Unassigned"] || 0) + 1;
      }
      
      // Real issue type data
      typeCounts[issue.typeId] = (typeCounts[issue.typeId] || 0) + 1;
    }
    
    console.log("Generated analytics:", { 
      totalIssues, 
      cityCounts, 
      clusterCounts, 
      typeCounts 
    });
    
    // Get audit trail data for advanced analytics if needed
    const auditTrailData = await getAuditTrail(undefined, 100);
    
    return {
      totalIssues,
      resolvedIssues,
      openIssues,
      resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
      avgResolutionTime: avgResolutionTime.toFixed(2),
      cityCounts,
      clusterCounts,
      managerCounts,
      typeCounts,
      // Include audit trail summary if needed
      recentActivity: auditTrailData || []
    };
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    return {
      totalIssues: 0,
      resolvedIssues: 0,
      openIssues: 0,
      resolutionRate: 0,
      avgResolutionTime: '0',
      cityCounts: {},
      clusterCounts: {},
      managerCounts: {},
      typeCounts: {},
    };
  }
};
