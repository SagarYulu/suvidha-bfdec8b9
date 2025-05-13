
import { supabase } from "@/integrations/supabase/client";
import { getUsers } from "@/services/userService";
import { IssueFilters } from "./issueFilters";
import { getIssues } from "./issueFilters";
import { getAuditTrail } from "./issueAuditService";
import { calculateFirstResponseTime } from "@/utils/workingTimeUtils";
import { Issue } from "@/types";

/**
 * Issue analytics service - provides analytics data for issues
 * 
 * Database mapping notes:
 * - In the issues table, `id` is the unique issue identifier
 * - In the issues table, `employee_uuid` contains the employee's UUID (maps to employees.id)
 * - All analytics are based on these relationships
 */
export const getAnalytics = async (filters?: IssueFilters) => {
  try {
    console.log("getAnalytics called with filters:", filters);
    
    // Always fetch fresh issues based on the provided filters
    const issues = await getIssues(filters);
    console.log(`Analytics processing ${issues.length} issues with filters:`, filters);
    
    if (issues.length === 0) {
      console.log("No issues found for the given filters, returning empty analytics");
      return {
        totalIssues: 0,
        resolvedIssues: 0,
        openIssues: 0,
        resolutionRate: 0,
        avgResolutionTime: '0',
        avgFirstResponseTime: '0',
        cityCounts: {},
        clusterCounts: {},
        managerCounts: {},
        typeCounts: {},
        recentActivity: []
      };
    }
    
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
    
    // Calculate First Response Time (FRT) with improved working-hours logic
    let avgFirstResponseTime = 0;
    
    try {
      // Fetch all audit trail entries for comments and status changes (first responses)
      const { data: auditData, error: auditError } = await supabase
        .from('issue_audit_trail')
        .select('*')
        .in('action', ['comment_added', 'status_changed']);
      
      if (auditError) {
        console.error("Error fetching audit data for FRT:", auditError);
      } else if (auditData && auditData.length > 0) {
        console.log(`Retrieved ${auditData.length} audit entries for FRT calculation`);
        
        // Group audit entries by issue ID
        const issueAudits: Record<string, any[]> = {};
        auditData.forEach(audit => {
          if (!issueAudits[audit.issue_id]) {
            issueAudits[audit.issue_id] = [];
          }
          issueAudits[audit.issue_id].push(audit);
        });
        
        // Calculate FRT for each issue with audit data
        let totalFRT = 0;
        let issuesWithFRT = 0;
        
        issues.forEach(issue => {
          if (issueAudits[issue.id]) {
            // Sort audits by creation time
            const sortedAudits = issueAudits[issue.id].sort(
              (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            
            // First audit entry after ticket creation is the first response
            const firstResponseAudit = sortedAudits[0];
            
            if (firstResponseAudit) {
              const frt = calculateFirstResponseTime(issue.createdAt, firstResponseAudit.created_at);
              console.log(`Issue ${issue.id} - FRT: ${frt.toFixed(2)} working hours`);
              if (frt > 0) {
                totalFRT += frt;
                issuesWithFRT++;
              }
            }
          }
        });
        
        if (issuesWithFRT > 0) {
          avgFirstResponseTime = totalFRT / issuesWithFRT;
          console.log(`Calculated average FRT: ${avgFirstResponseTime.toFixed(2)} working hours across ${issuesWithFRT} issues`);
        } else {
          console.log("No valid FRT data found for any issues");
        }
      }
    } catch (frtError) {
      console.error("Error calculating FRT:", frtError);
    }
    
    // Fetch employee data directly from the employees table
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*');
      
    if (employeesError) {
      console.error('Error fetching employees for analytics:', employeesError);
    }
    
    // City-wise issues
    const cityCounts: Record<string, number> = {};
    // Cluster-wise issues
    const clusterCounts: Record<string, number> = {};
    // Manager-wise issues
    const managerCounts: Record<string, number> = {};
    // Issue type distribution
    const typeCounts: Record<string, number> = {};
    
    // Process each issue and map it to the correct employee data
    for (const issue of issues) {
      // Find the employee who created this issue
      const employee = employees?.find(emp => emp.id === issue.employeeUuid);
      
      if (employee) {
        // Use actual employee data for analytics
        const city = employee.city || "Unknown";
        cityCounts[city] = (cityCounts[city] || 0) + 1;
        
        const cluster = employee.cluster || "Unknown";
        clusterCounts[cluster] = (clusterCounts[cluster] || 0) + 1;
        
        // Use the actual manager name from employee data
        const manager = employee.manager || "Unassigned";
        managerCounts[manager] = (managerCounts[manager] || 0) + 1;
      } else {
        // Fallback for issues without valid employee data
        cityCounts["Unknown"] = (cityCounts["Unknown"] || 0) + 1;
        clusterCounts["Unknown"] = (clusterCounts["Unknown"] || 0) + 1;
        managerCounts["Unassigned"] = (managerCounts["Unassigned"] || 0) + 1;
      }
      
      // Real issue type data
      typeCounts[issue.typeId] = (typeCounts[issue.typeId] || 0) + 1;
    }
    
    // Get audit trail data for advanced analytics if needed
    const auditTrailData = await getAuditTrail(undefined, 100);
    
    return {
      totalIssues,
      resolvedIssues,
      openIssues,
      resolutionRate: totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0,
      avgResolutionTime: avgResolutionTime.toFixed(2),
      avgFirstResponseTime: avgFirstResponseTime.toFixed(2),
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
      avgFirstResponseTime: '0',
      cityCounts: {},
      clusterCounts: {},
      managerCounts: {},
      typeCounts: {},
      recentActivity: []
    };
  }
};
