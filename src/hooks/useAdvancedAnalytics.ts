import { useQuery } from "@tanstack/react-query";
import { AdvancedFilters } from "@/components/admin/analytics/types";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface AnalyticsData {
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  openTickets: number;
  ftrsTime: number;
  firstResponseSLABreach: number;
  ftrRate: number;
  avgResolutionTime: number;
  avgFirstResponseTime: number;
  resolutionSLABreach: number;
  reopenCount: number;
  reopenRate: number;
  // SLA breach metrics
  closedResolvedSLABreach: number;
  overallSLABreach: number;
  openInProgressSLABreach: number;
  assigneeSLABreach: number;
  // Raw issues data for accurate SLA calculations
  rawIssues: any[];
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
      // Format dates correctly for API requests
      const startDate = filters.dateRange?.from ? 
        format(filters.dateRange.from, 'yyyy-MM-dd') : 
        undefined;
      
      const endDate = filters.dateRange?.to ? 
        format(filters.dateRange.to, 'yyyy-MM-dd') : 
        undefined;
      
      console.log("Fetching analytics with filters:", {
        ...filters,
        dateRange: {
          startDate,
          endDate
        }
      });
      
      // Base query modifiers for all queries
      let queryModifiers = supabase
        .from('issues')
        .select('*', { count: 'exact' });
        
      if (startDate) {
        queryModifiers = queryModifiers.gte('created_at', `${startDate}T00:00:00`);
      }
      
      if (endDate) {
        queryModifiers = queryModifiers.lte('created_at', `${endDate}T23:59:59`);
      }
      
      // Apply filters
      if (filters.city && filters.city !== 'all-cities') {
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
      
      if (filters.cluster && filters.cluster !== 'all-clusters') {
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
      
      if (filters.manager && filters.manager !== 'all-managers') {
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
      
      if (filters.role && filters.role !== 'all-roles') {
        // For role filter
        const { data: employeeIds } = await supabase
          .from('employees')
          .select('id')
          .eq('role', filters.role);
          
        if (employeeIds && employeeIds.length > 0) {
          const empIds = employeeIds.map(e => e.id);
          queryModifiers = queryModifiers.in('employee_uuid', empIds);
        }
      }
      
      if (filters.issueType && filters.issueType !== 'all-issues') {
        queryModifiers = queryModifiers.eq('type_id', filters.issueType);
      }
      
      // Get total tickets count
      const { count: totalTickets, error: countError } = await queryModifiers;
      
      if (countError) {
        console.error("Error fetching total tickets count:", countError);
        throw countError;
      }
      
      // Get resolved tickets
      const { count: resolvedTickets, error: resolvedError } = await queryModifiers
        .or('status.eq.closed,status.eq.resolved');
        
      if (resolvedError) {
        console.error("Error fetching resolved tickets count:", resolvedError);
        throw resolvedError;
      }
      
      // Get open tickets
      const { count: openTickets, error: openError } = await queryModifiers
        .not('status', 'in', '("closed","resolved")');
      
      if (openError) {
        console.error("Error fetching open tickets count:", openError);
        throw openError;
      }
      
      // Fetch raw issues with comments for SLA calculation
      const { data: rawIssues, error: rawIssuesError } = await supabase
        .from('issues')
        .select(`
          *,
          issue_comments (
            id,
            content,
            created_at,
            employee_uuid
          )
        `)
        .order('created_at', { ascending: false });
      
      if (rawIssuesError) {
        console.error("Error fetching raw issues:", rawIssuesError);
        throw rawIssuesError;
      }
      
      // Calculate resolution rate
      const resolutionRate = totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0;
      
      // Get FTRS data by analyzing comments
      const { data: issuesWithComments, error: issuesWithCommentsError } = await supabase
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
        
      if (issuesWithCommentsError) {
        console.error("Error fetching issues with comments:", issuesWithCommentsError);
        throw issuesWithCommentsError;
      }
      
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
          
          // Calculate response time in hours - working hours only (8hr workday)
          const responseTimeHours = calculateWorkingHours(issueCreatedAt, firstCommentCreatedAt);
          
          totalResponseTime += responseTimeHours;
          ticketsWithResponse++;
          
          if (responseTimeHours > slaBenchmark) {
            slaBreachCount++;
          }
        }
      });
      
      const ftrsTime = ticketsWithResponse > 0 ? totalResponseTime / ticketsWithResponse : 0;
      const firstResponseSLABreach = ticketsWithResponse > 0 ? (slaBreachCount / ticketsWithResponse) * 100 : 0;
      const avgFirstResponseTime = ftrsTime;
      
      // First time resolution rate - tickets resolved with just one response
      let ftrCount = 0;
      issuesWithComments?.forEach(issue => {
        if (issue.issue_comments && issue.issue_comments.length === 1) {
          ftrCount++;
        }
      });
      
      const ftrRate = resolvedTickets > 0 ? (ftrCount / resolvedTickets) * 100 : 0;
      
      // Average resolution time
      const { data: resolvedIssuesData, error: resolvedIssuesError } = await supabase
        .from('issues')
        .select('created_at, closed_at')
        .or('status.eq.closed,status.eq.resolved');
        
      if (resolvedIssuesError) {
        console.error("Error fetching resolved issues:", resolvedIssuesError);
        throw resolvedIssuesError;
      }
      
      let totalResolutionTime = 0;
      let closedIssuesCount = 0;
      let resolutionSLABreachCount = 0;
      const resolutionSLABenchmark = 48; // 48 hours for resolution SLA
      
      resolvedIssuesData?.forEach(issue => {
        if (issue.closed_at && issue.created_at) {
          const createdAt = new Date(issue.created_at);
          const closedAt = new Date(issue.closed_at);
          
          // Calculate resolution time in hours - working hours only
          const resolutionTimeHours = calculateWorkingHours(createdAt, closedAt);
          
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
      
      const openInProgressTickets = rawIssues?.filter(issue => 
        issue.status === 'open' || issue.status === 'in_progress') || [];
      
      openInProgressTickets.forEach(issue => {
        const createdAt = new Date(issue.created_at);
        const now = new Date();
        const hoursElapsed = calculateWorkingHours(createdAt, now);
        
        if (hoursElapsed > openInProgressSLABenchmark) {
          openInProgressBreachCount++;
        }
      });
      
      const openInProgressCount = openInProgressTickets.length;
      const openInProgressSLABreach = openInProgressCount > 0 ? 
        (openInProgressBreachCount / openInProgressCount) * 100 : 0;
      
      // 3. Assignee SLA Breach
      let assigneeBreachCount = 0;
      const assigneeSLABenchmark = 8; // 8 hours for assignee response
      
      // Filter for assigned tickets
      const assignedTickets = rawIssues?.filter(issue => issue.assigned_to) || [];
      
      assignedTickets.forEach(issue => {
        // For simplicity, we'll check if any assigned ticket has not been updated within the SLA timeframe
        const updatedAt = new Date(issue.updated_at);
        const now = new Date();
        const hoursElapsed = calculateWorkingHours(updatedAt, now);
        
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
      const weekdayCount = rawIssues?.filter(issue => {
        const date = new Date(issue.created_at);
        const day = date.getDay();
        // 0 is Sunday, 6 is Saturday
        return day > 0 && day < 6;
      }).length || 0;
      
      const weekendCount = (rawIssues?.length || 0) - weekdayCount;
      
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
        avgFirstResponseTime,
        resolutionSLABreach,
        reopenCount,
        reopenRate,
        // SLA breach metrics
        closedResolvedSLABreach,
        overallSLABreach,
        openInProgressSLABreach,
        assigneeSLABreach,
        // Raw data for SLA calculations
        rawIssues: rawIssues || [],
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

// Helper function to calculate working hours between two dates
// Working hours are 9 AM - 5 PM on weekdays (8 hour workday)
function calculateWorkingHours(startDate: Date, endDate: Date): number {
  // Ensure startDate is before endDate
  if (startDate > endDate) return 0;
  
  let totalHours = 0;
  const millisecondsPerHour = 60 * 60 * 1000;
  const millisecondsPerWorkingDay = 8 * millisecondsPerHour; // 8 working hours per day
  
  // Clone dates to avoid modifying the originals
  const currentDate = new Date(startDate);
  const endDateTime = endDate.getTime();
  
  while (currentDate.getTime() < endDateTime) {
    // Get day of the week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = currentDate.getDay();
    
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Set to start of workday (9 AM) if it's earlier
      if (currentDate.getHours() < 9) {
        currentDate.setHours(9, 0, 0, 0);
      }
      
      // If we're beyond end of workday (5 PM), move to next day
      if (currentDate.getHours() >= 17) {
        currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(9, 0, 0, 0);
        continue;
      }
      
      // Calculate time until end of current day's work hours or until endDate
      let endOfDay = new Date(currentDate);
      endOfDay.setHours(17, 0, 0, 0);
      
      // If endDate is earlier than end of workday, use endDate instead
      if (endDateTime < endOfDay.getTime()) {
        endOfDay = new Date(endDateTime);
      }
      
      // Add hours for this work period
      const hoursWorked = (endOfDay.getTime() - currentDate.getTime()) / millisecondsPerHour;
      totalHours += hoursWorked;
      
      // Move to next work period
      currentDate.setTime(endOfDay.getTime());
    } else {
      // Skip to next day at 9 AM
      currentDate.setDate(currentDate.getDate() + 1);
      currentDate.setHours(9, 0, 0, 0);
    }
  }
  
  return Math.max(0, totalHours);
}
