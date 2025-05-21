import { useQuery } from "@tanstack/react-query";
import { AdvancedFilters } from "@/components/admin/analytics/types";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  openTickets: number;
  ftrsTime: number;
  firstResponseSLABreach: number;
  ftrRate: number;
  avgResolutionTime: number;
  resolutionSLABreach: number;
  reopenCount: number;
  reopenRate: number;
  // SLA breach metrics
  closedResolvedSLABreach: number;
  overallSLABreach: number;
  openInProgressSLABreach: number;
  assigneeSLABreach: number;
  priorityDistribution: {
    priority: string;
    count: number;
  }[];
  statusDistribution: {
    status: string;
    count: number;
  }[];
  topIssueTypes: {
    type: string;
    count: number;
  }[];
  weekdayVsWeekend: {
    dayType: string;
    count: number;
    slaBreachPercentage?: number;
  }[];
  assigneeReplyTrend: {
    assignee: string;
    replies: number;
  }[];
  ticketSpikeData: {
    hasSpike: boolean;
    spikePercentage: number;
    previousPeriodCount: number;
    currentPeriodCount: number;
  };
}

export const useAdvancedAnalytics = (filters: AdvancedFilters) => {
  return useQuery({
    queryKey: ['advancedAnalytics', filters],
    queryFn: async (): Promise<AnalyticsData> => {
      // Create a date range filter for Supabase queries
      const startDate = filters.dateRange.from?.toISOString();
      const endDate = filters.dateRange.to?.toISOString();
      
      // Base query modifiers for all queries
      let queryModifiers = supabase
        .from('issues')
        .select('*', { count: 'exact' });
        
      if (startDate) {
        queryModifiers = queryModifiers.gte('created_at', startDate);
      }
      
      if (endDate) {
        queryModifiers = queryModifiers.lte('created_at', endDate);
      }
      
      // Apply filters
      if (filters.city) {
        // Assuming issues are linked to employees and employees have city
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('city', filters.city);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.cluster) {
        // Similar approach for cluster filter
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('cluster', filters.cluster);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.manager) {
        // For manager filter
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('manager', filters.manager);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.issueType) {
        queryModifiers = queryModifiers.eq('type_id', filters.issueType);
      }
      
      // Get all issues for analysis
      const { data: allIssues } = await queryModifiers;
      
      // Get total tickets count
      const { count: totalTickets } = await queryModifiers;
      
      // Get resolved tickets
      const { count: resolvedTickets } = await queryModifiers
        .eq('status', 'closed');
        
      // Get open tickets
      const { count: openTickets } = await queryModifiers
        .neq('status', 'closed');
        
      // Calculate resolution rate
      const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
      
      // Get FTRS data by analyzing comments
      const { data: issuesWithComments } = await supabase
        .from('issues')
        .select(`
          id, 
          created_at,
          issue_comments (
            id, 
            created_at, 
            employee_uuid
          )
        `);
        
      let totalResponseTime = 0;
      let ticketsWithResponse = 0;
      let slaBreachCount = 0;
      const slaBenchmark = 4; // SLA of 4 hours for first response
      
      issuesWithComments?.forEach(issue => {
        if (issue.issue_comments && issue.issue_comments.length > 0) {
          // Sort comments by creation time
          const sortedComments = [...issue.issue_comments].sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          
          const issueCreatedAt = new Date(issue.created_at);
          const firstCommentCreatedAt = new Date(sortedComments[0].created_at);
          
          // Calculate response time in hours
          const responseTimeHours = (firstCommentCreatedAt.getTime() - issueCreatedAt.getTime()) / (1000 * 60 * 60);
          
          totalResponseTime += responseTimeHours;
          ticketsWithResponse++;
          
          if (responseTimeHours > slaBenchmark) {
            slaBreachCount++;
          }
        }
      });
      
      const ftrsTime = ticketsWithResponse > 0 ? totalResponseTime / ticketsWithResponse : 0;
      const firstResponseSLABreach = ticketsWithResponse > 0 ? (slaBreachCount / ticketsWithResponse) * 100 : 0;
      
      // First time resolution rate - tickets resolved with just one response
      let ftrCount = 0;
      issuesWithComments?.forEach(issue => {
        if (issue.issue_comments && issue.issue_comments.length === 1) {
          ftrCount++;
        }
      });
      
      const ftrRate = resolvedTickets > 0 ? (ftrCount / resolvedTickets) * 100 : 0;
      
      // Average resolution time
      const { data: resolvedIssuesData } = await supabase
        .from('issues')
        .select('created_at, closed_at')
        .eq('status', 'closed');
        
      let totalResolutionTime = 0;
      let closedIssuesCount = 0;
      let resolutionSLABreachCount = 0;
      const resolutionSLABenchmark = 48; // 48 hours for resolution SLA
      
      resolvedIssuesData?.forEach(issue => {
        if (issue.closed_at && issue.created_at) {
          const createdAt = new Date(issue.created_at);
          const closedAt = new Date(issue.closed_at);
          
          // Calculate resolution time in hours
          const resolutionTimeHours = (closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          
          totalResolutionTime += resolutionTimeHours;
          closedIssuesCount++;
          
          if (resolutionTimeHours > resolutionSLABenchmark) {
            resolutionSLABreachCount++;
          }
        }
      });
      
      const avgResolutionTime = closedIssuesCount > 0 ? totalResolutionTime / closedIssuesCount : 0;
      const resolutionSLABreach = closedIssuesCount > 0 ? (resolutionSLABreachCount / closedIssuesCount) * 100 : 0;
      
      // Reopen count and rate
      // Query issue_audit_trail to find reopened tickets
      const { data: auditData } = await supabase
        .from('issue_audit_trail')
        .select('*')
        .eq('action', 'status_changed');
      
      let reopenCount = 0;
      const reopenedTickets = new Set();
      
      auditData?.forEach(audit => {
        const details = audit.details as any;
        if (details && details.previous_status === 'closed' && details.new_status !== 'closed') {
          reopenCount++;
          reopenedTickets.add(audit.issue_id);
        }
      });
      
      const reopenRate = resolvedTickets > 0 ? (reopenedTickets.size / resolvedTickets) * 100 : 0;
      
      // Calculate SLA breach metrics
      // 1. Closed & Resolved SLA Breach (already calculated in resolutionSLABreach)
      const closedResolvedSLABreach = resolutionSLABreach;
      
      // 2. Open & In Progress SLA Breach
      let openInProgressBreachCount = 0;
      const openInProgressSLABenchmark = 24; // 24 hours for open/in progress tickets
      
      allIssues?.forEach(issue => {
        if (issue.status === 'open' || issue.status === 'in_progress') {
          const createdAt = new Date(issue.created_at);
          const now = new Date();
          const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
          
          if (hoursElapsed > openInProgressSLABenchmark) {
            openInProgressBreachCount++;
          }
        }
      });
      
      const openInProgressCount = allIssues?.filter(issue => 
        issue.status === 'open' || issue.status === 'in_progress').length || 0;
      const openInProgressSLABreach = openInProgressCount > 0 ? 
        (openInProgressBreachCount / openInProgressCount) * 100 : 0;
      
      // 3. Assignee SLA Breach
      let assigneeBreachCount = 0;
      const assigneeSLABenchmark = 8; // 8 hours for assignee response
      
      // Filter for assigned tickets
      const assignedTickets = allIssues?.filter(issue => issue.assigned_to) || [];
      
      assignedTickets.forEach(issue => {
        // For simplicity, we'll check if any assigned ticket has not been updated within the SLA timeframe
        const updatedAt = new Date(issue.updated_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursElapsed > assigneeSLABenchmark) {
          assigneeBreachCount++;
        }
      });
      
      const assigneeSLABreach = assignedTickets.length > 0 ? 
        (assigneeBreachCount / assignedTickets.length) * 100 : 0;
      
      // 4. Overall SLA Breach (average of all SLA breach types)
      const overallSLABreach = (
        closedResolvedSLABreach + 
        firstResponseSLABreach + 
        openInProgressSLABreach + 
        assigneeSLABreach
      ) / 4;
      
      // Other metrics and charts data
      // Priority distribution
      const { data: priorityResults } = await supabase
        .from('issues')
        .select('priority');
      
      const priorityCounts: Record<string, number> = {};
      priorityResults?.forEach(issue => {
        priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
      });
      
      const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count
      }));
      
      // Status distribution
      const { data: statusResults } = await supabase
        .from('issues')
        .select('status');
        
      const statusCounts: Record<string, number> = {};
      statusResults?.forEach(issue => {
        statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
      });
      
      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count
      }));
      
      // Top issue types
      const { data: typeResults } = await supabase
        .from('issues')
        .select('type_id');
        
      const typeCounts: Record<string, number> = {};
      typeResults?.forEach(issue => {
        typeCounts[issue.type_id] = (typeCounts[issue.type_id] || 0) + 1;
      });
      
      const topIssueTypes = Object.entries(typeCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // Weekday vs Weekend volume
      const weekdayCount = allIssues?.filter(issue => {
        const date = new Date(issue.created_at);
        const day = date.getDay();
        // 0 is Sunday, 6 is Saturday
        return day > 0 && day < 6;
      }).length || 0;
      
      const weekendCount = (allIssues?.length || 0) - weekdayCount;
      
      const weekdayVsWeekend = [
        { dayType: 'Weekday', count: weekdayCount },
        { dayType: 'Weekend', count: weekendCount }
      ];
      
      // Assignee reply trend - count comments by assignee
      const { data: commentResults } = await supabase
        .from('issue_comments')
        .select('employee_uuid');
        
      const assigneeReplyCounts: Record<string, number> = {};
      commentResults?.forEach(comment => {
        assigneeReplyCounts[comment.employee_uuid] = (assigneeReplyCounts[comment.employee_uuid] || 0) + 1;
      });
      
      const assigneeReplyTrend = await Promise.all(
        Object.entries(assigneeReplyCounts).map(async ([employeeUuid, replies]) => {
          // Get employee name
          const { data: employee } = await supabase
            .from('employees')
            .select('name')
            .eq('id', employeeUuid)
            .maybeSingle();
            
          return {
            assignee: employee?.name || employeeUuid,
            replies
          };
        })
      );
      
      // Ticket spike alerts - compare with previous period
      const now = new Date();
      let previousPeriodStart, previousPeriodEnd;
      
      if (startDate && endDate) {
        const currentStart = new Date(startDate);
        const currentEnd = new Date(endDate);
        const periodDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
        
        previousPeriodStart = new Date(currentStart);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
        
        previousPeriodEnd = new Date(currentStart);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
      } else {
        // Default to comparing with previous 7 days
        previousPeriodStart = new Date(now);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
        
        previousPeriodEnd = new Date(now);
        previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 7);
      }
      
      // Count tickets in previous period
      const { count: previousPeriodCount } = await supabase
        .from('issues')
        .select('*', { count: 'exact' })
        .gte('created_at', previousPeriodStart.toISOString())
        .lte('created_at', previousPeriodEnd.toISOString());
        
      // Determine if there's a spike (>20% increase)
      const spikeThreshold = 20;
      const currentPeriodCount = totalTickets || 0;
      let spikePercentage = 0;
      
      if (previousPeriodCount && previousPeriodCount > 0) {
        spikePercentage = ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
      }
      
      const hasSpike = spikePercentage > spikeThreshold;
      
      return {
        totalTickets: totalTickets || 0,
        resolvedTickets: resolvedTickets || 0,
        resolutionRate,
        openTickets: openTickets || 0,
        ftrsTime,
        firstResponseSLABreach,
        ftrRate,
        avgResolutionTime,
        resolutionSLABreach,
        reopenCount,
        reopenRate,
        // SLA breach metrics
        closedResolvedSLABreach,
        overallSLABreach,
        openInProgressSLABreach,
        assigneeSLABreach,
        priorityDistribution,
        statusDistribution,
        topIssueTypes,
        weekdayVsWeekend,
        assigneeReplyTrend,
        ticketSpikeData: {
          hasSpike,
          spikePercentage,
          previousPeriodCount: previousPeriodCount || 0,
          currentPeriodCount
        }
      };
    },
    enabled: !!filters.dateRange.from && !!filters.dateRange.to,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
};
