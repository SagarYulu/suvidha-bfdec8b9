
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subMonths, subWeeks, subYears, parseISO } from "date-fns";

// Define types for trend analysis
export interface TrendFilters {
  city?: string | null;
  cluster?: string | null;
  manager?: string | null;
  role?: string | null;
  issueType?: string | null;
  dateRange?: {
    start: string;
    end: string;
  };
  comparisonMode: "day" | "week" | "month" | "quarter" | "year";
}

export interface TrendKPIData {
  totalTickets: number;
  resolvedTickets: number;
  resolutionRate: number;
  openTickets: number;
  firstResponseTime: number; // Average time in hours
  firstResponseSLABreach: number; // Percentage
  firstTimeResolution: number; // Percentage
  averageResolutionTime: number; // In hours
  resolutionSLABreach: number; // Percentage
  reopenCount: number;
  reopenRate: number;
}

export interface PriorityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface StatusDistribution {
  open: number;
  in_progress: number;
  resolved: number;
  closed: number;
}

export interface IssueTypeCount {
  typeId: string;
  typeName: string;
  count: number;
}

export interface WeekdayDistribution {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface ManagerClusterTrend {
  manager: string;
  cluster: string;
  ticketCount: number;
  averageResolutionTime: number;
}

export interface TicketTrendPoint {
  date: string;
  raised: number;
  closed: number;
  comparisonDate?: string;
  comparisonRaised?: number;
  comparisonClosed?: number;
}

export interface ResolutionTimeByType {
  typeId: string;
  typeName: string;
  averageTime: number; // in hours
  ticketCount: number;
}

export interface ClosureByAssignee {
  assigneeId: string;
  assigneeName: string;
  closedTickets: number;
  averageResolutionTime: number; // in hours
}

export interface TrendAnalyticsData {
  kpis: TrendKPIData;
  priorityDistribution: PriorityDistribution;
  statusDistribution: StatusDistribution;
  topIssueTypes: IssueTypeCount[];
  weekdayDistribution: WeekdayDistribution;
  managerTrends: ManagerClusterTrend[];
  ticketTrends: TicketTrendPoint[];
  resolutionByType: ResolutionTimeByType[];
  closureByAssignee: ClosureByAssignee[];
  ticketSpikes: { date: string; count: number; percentageIncrease: number }[];
}

// Helper functions to calculate comparison date ranges
const getComparisonDates = (
  startDate: string,
  endDate: string,
  mode: "day" | "week" | "month" | "quarter" | "year"
): { comparisonStart: string; comparisonEnd: string } => {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  
  // Calculate the duration in days
  const durationInMs = end.getTime() - start.getTime();
  const durationInDays = Math.ceil(durationInMs / (1000 * 60 * 60 * 24));
  
  let comparisonStart, comparisonEnd;
  
  switch (mode) {
    case "day":
      comparisonStart = format(subDays(start, 1), "yyyy-MM-dd");
      comparisonEnd = format(subDays(end, 1), "yyyy-MM-dd");
      break;
    case "week":
      comparisonStart = format(subDays(start, 7), "yyyy-MM-dd");
      comparisonEnd = format(subDays(end, 7), "yyyy-MM-dd");
      break;
    case "month":
      comparisonStart = format(subMonths(start, 1), "yyyy-MM-dd");
      comparisonEnd = format(subMonths(end, 1), "yyyy-MM-dd");
      break;
    case "quarter":
      comparisonStart = format(subMonths(start, 3), "yyyy-MM-dd");
      comparisonEnd = format(subMonths(end, 3), "yyyy-MM-dd");
      break;
    case "year":
      comparisonStart = format(subYears(start, 1), "yyyy-MM-dd");
      comparisonEnd = format(subYears(end, 1), "yyyy-MM-dd");
      break;
    default:
      comparisonStart = format(subDays(start, durationInDays), "yyyy-MM-dd");
      comparisonEnd = format(subDays(end, durationInDays), "yyyy-MM-dd");
  }
  
  return { comparisonStart, comparisonEnd };
};

// Function to add employee filters to query
const addEmployeeFilters = async (
  filters: TrendFilters
): Promise<string[] | undefined> => {
  // If no employee filters, return undefined
  if (!filters.city && !filters.cluster && !filters.manager && !filters.role) {
    return undefined;
  }

  // Build employee query
  let query = supabase.from('employees').select('id');
  
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  
  if (filters.cluster) {
    query = query.eq('cluster', filters.cluster);
  }
  
  if (filters.manager) {
    query = query.eq('manager', filters.manager);
  }
  
  if (filters.role) {
    query = query.eq('role', filters.role);
  }
  
  const { data: employees, error } = await query;
  
  if (error) {
    console.error('Error fetching employees for filtering:', error);
    return [];
  }
  
  return employees?.map(emp => emp.id) || [];
};

// Main function to get trend analytics data
export const getTicketTrendAnalytics = async (
  filters: TrendFilters
): Promise<TrendAnalyticsData> => {
  try {
    console.log("Fetching ticket trend analytics with filters:", filters);
    
    // Prepare date filters
    const startDate = filters.dateRange?.start || format(subMonths(new Date(), 1), "yyyy-MM-dd");
    const endDate = filters.dateRange?.end || format(new Date(), "yyyy-MM-dd");
    
    // Get comparison dates based on the comparison mode
    const { comparisonStart, comparisonEnd } = getComparisonDates(
      startDate,
      endDate,
      filters.comparisonMode
    );
    
    console.log("Date range:", startDate, "to", endDate);
    console.log("Comparison range:", comparisonStart, "to", comparisonEnd);
    
    // Get employee UUIDs based on filters
    const employeeUuids = await addEmployeeFilters(filters);
    
    // Build base query for tickets
    let ticketQuery = supabase.from('issues').select('*');
    
    // Apply date filter
    ticketQuery = ticketQuery.gte('created_at', startDate).lte('created_at', endDate);
    
    // Apply employee filter if available
    if (employeeUuids && employeeUuids.length > 0) {
      ticketQuery = ticketQuery.in('employee_uuid', employeeUuids);
    }
    
    // Apply issue type filter if available
    if (filters.issueType) {
      ticketQuery = ticketQuery.eq('type_id', filters.issueType);
    }
    
    // Execute query
    const { data: tickets, error } = await ticketQuery;
    
    if (error) {
      console.error('Error fetching tickets:', error);
      throw new Error(`Failed to fetch ticket data: ${error.message}`);
    }
    
    console.log(`Retrieved ${tickets?.length || 0} tickets for trend analysis`);
    
    // Now get comparison period tickets
    let comparisonQuery = supabase.from('issues').select('*');
    
    // Apply comparison date filter
    comparisonQuery = comparisonQuery.gte('created_at', comparisonStart).lte('created_at', comparisonEnd);
    
    // Apply the same filters as the main query
    if (employeeUuids && employeeUuids.length > 0) {
      comparisonQuery = comparisonQuery.in('employee_uuid', employeeUuids);
    }
    
    if (filters.issueType) {
      comparisonQuery = comparisonQuery.eq('type_id', filters.issueType);
    }
    
    // Execute comparison query
    const { data: comparisonTickets, error: comparisonError } = await comparisonQuery;
    
    if (comparisonError) {
      console.error('Error fetching comparison tickets:', comparisonError);
      // Don't throw error here, we can still proceed with main data
    }
    
    console.log(`Retrieved ${comparisonTickets?.length || 0} tickets for comparison period`);
    
    // Calculate KPIs
    const ticketsArray = tickets || [];
    const comparisonTicketsArray = comparisonTickets || [];
    
    // Basic counts
    const totalTickets = ticketsArray.length;
    const resolvedTickets = ticketsArray.filter(t => 
      t.status === 'resolved' || t.status === 'closed'
    ).length;
    
    const resolutionRate = totalTickets > 0 
      ? (resolvedTickets / totalTickets) * 100 
      : 0;
    
    const openTickets = ticketsArray.filter(t => 
      t.status === 'open' || t.status === 'in_progress'
    ).length;
    
    // TODO: For first response time and SLA breach, we'd need comment data
    // Using placeholder values for now
    const firstResponseTime = 4; // Average 4 hours (placeholder)
    const firstResponseSLABreach = 15; // 15% (placeholder)
    
    // First time resolution (tickets resolved without being reopened)
    const firstTimeResolution = resolvedTickets > 0 ? 85 : 0; // 85% (placeholder)
    
    // Average resolution time (in hours)
    let totalResolutionTime = 0;
    let ticketsWithResolution = 0;
    
    ticketsArray.forEach(ticket => {
      if (ticket.closed_at && ticket.created_at) {
        const createdDate = new Date(ticket.created_at);
        const closedDate = new Date(ticket.closed_at);
        const resolutionTimeMs = closedDate.getTime() - createdDate.getTime();
        const resolutionTimeHours = resolutionTimeMs / (1000 * 60 * 60);
        totalResolutionTime += resolutionTimeHours;
        ticketsWithResolution++;
      }
    });
    
    const averageResolutionTime = ticketsWithResolution > 0 
      ? totalResolutionTime / ticketsWithResolution
      : 0;
    
    // SLA breach (placeholder - would need actual SLA data)
    const resolutionSLABreach = 10; // 10% (placeholder)
    
    // Reopen count and rate (placeholder - would need reopen history)
    const reopenCount = Math.round(totalTickets * 0.05); // 5% of tickets (placeholder)
    const reopenRate = totalTickets > 0 ? (reopenCount / totalTickets) * 100 : 0;
    
    // Priority distribution
    const priorityDistribution = {
      low: ticketsArray.filter(t => t.priority === 'low').length,
      medium: ticketsArray.filter(t => t.priority === 'medium').length,
      high: ticketsArray.filter(t => t.priority === 'high').length,
      critical: ticketsArray.filter(t => t.priority === 'critical').length,
    };
    
    // Status distribution
    const statusDistribution = {
      open: ticketsArray.filter(t => t.status === 'open').length,
      in_progress: ticketsArray.filter(t => t.status === 'in_progress').length,
      resolved: ticketsArray.filter(t => t.status === 'resolved').length,
      closed: ticketsArray.filter(t => t.status === 'closed').length,
    };
    
    // Top issue types
    const issueTypeCounts: Record<string, { count: number; typeName: string }> = {};
    
    ticketsArray.forEach(ticket => {
      if (!issueTypeCounts[ticket.type_id]) {
        issueTypeCounts[ticket.type_id] = { count: 0, typeName: ticket.type_id };
      }
      issueTypeCounts[ticket.type_id].count++;
    });
    
    const topIssueTypes = Object.entries(issueTypeCounts)
      .map(([typeId, data]) => ({
        typeId,
        typeName: data.typeName,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    // Weekday distribution (simplified approach)
    const weekdayDistribution = {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0
    };
    
    ticketsArray.forEach(ticket => {
      const createdDate = new Date(ticket.created_at);
      const day = createdDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      switch (day) {
        case 0: weekdayDistribution.sunday++; break;
        case 1: weekdayDistribution.monday++; break;
        case 2: weekdayDistribution.tuesday++; break;
        case 3: weekdayDistribution.wednesday++; break;
        case 4: weekdayDistribution.thursday++; break;
        case 5: weekdayDistribution.friday++; break;
        case 6: weekdayDistribution.saturday++; break;
      }
    });
    
    // Manager & cluster trends (would need to join with employee data for actual implementation)
    // Using placeholder data
    const managerTrends: ManagerClusterTrend[] = [
      {
        manager: "Manager 1",
        cluster: "Cluster A",
        ticketCount: Math.floor(totalTickets * 0.3),
        averageResolutionTime: averageResolutionTime * 0.9
      },
      {
        manager: "Manager 2",
        cluster: "Cluster B",
        ticketCount: Math.floor(totalTickets * 0.4),
        averageResolutionTime: averageResolutionTime * 1.1
      },
      {
        manager: "Manager 3",
        cluster: "Cluster C",
        ticketCount: Math.floor(totalTickets * 0.3),
        averageResolutionTime: averageResolutionTime * 1.0
      }
    ];
    
    // Ticket trends over time
    const ticketTrends: TicketTrendPoint[] = [];
    
    // Group tickets by date
    const ticketsByDate: Record<string, { raised: number, closed: number }> = {};
    const comparisonTicketsByDate: Record<string, { raised: number, closed: number }> = {};
    
    // Process main period tickets
    ticketsArray.forEach(ticket => {
      const createdDate = format(new Date(ticket.created_at), "yyyy-MM-dd");
      if (!ticketsByDate[createdDate]) {
        ticketsByDate[createdDate] = { raised: 0, closed: 0 };
      }
      ticketsByDate[createdDate].raised++;
      
      if (ticket.closed_at) {
        const closedDate = format(new Date(ticket.closed_at), "yyyy-MM-dd");
        if (!ticketsByDate[closedDate]) {
          ticketsByDate[closedDate] = { raised: 0, closed: 0 };
        }
        ticketsByDate[closedDate].closed++;
      }
    });
    
    // Process comparison period tickets
    comparisonTicketsArray.forEach(ticket => {
      const createdDate = format(new Date(ticket.created_at), "yyyy-MM-dd");
      if (!comparisonTicketsByDate[createdDate]) {
        comparisonTicketsByDate[createdDate] = { raised: 0, closed: 0 };
      }
      comparisonTicketsByDate[createdDate].raised++;
      
      if (ticket.closed_at) {
        const closedDate = format(new Date(ticket.closed_at), "yyyy-MM-dd");
        if (!comparisonTicketsByDate[closedDate]) {
          comparisonTicketsByDate[closedDate] = { raised: 0, closed: 0 };
        }
        comparisonTicketsByDate[closedDate].closed++;
      }
    });
    
    // Create trend points for each date
    Object.entries(ticketsByDate).forEach(([date, counts]) => {
      // Find comparison date based on mode
      let comparisonDate;
      let comparisonData;
      
      switch (filters.comparisonMode) {
        case "day":
          comparisonDate = format(subDays(parseISO(date), 1), "yyyy-MM-dd");
          break;
        case "week":
          comparisonDate = format(subWeeks(parseISO(date), 1), "yyyy-MM-dd");
          break;
        case "month":
          comparisonDate = format(subMonths(parseISO(date), 1), "yyyy-MM-dd");
          break;
        case "quarter":
          comparisonDate = format(subMonths(parseISO(date), 3), "yyyy-MM-dd");
          break;
        case "year":
          comparisonDate = format(subYears(parseISO(date), 1), "yyyy-MM-dd");
          break;
        default:
          comparisonDate = format(subDays(parseISO(date), 1), "yyyy-MM-dd");
      }
      
      comparisonData = comparisonTicketsByDate[comparisonDate];
      
      ticketTrends.push({
        date,
        raised: counts.raised,
        closed: counts.closed,
        comparisonDate,
        comparisonRaised: comparisonData?.raised || 0,
        comparisonClosed: comparisonData?.closed || 0
      });
    });
    
    // Sort by date
    ticketTrends.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Resolution time by issue type
    const resolutionByType: Record<string, { totalTime: number, count: number, typeName: string }> = {};
    
    ticketsArray.forEach(ticket => {
      if (ticket.closed_at && ticket.created_at) {
        const createdDate = new Date(ticket.created_at);
        const closedDate = new Date(ticket.closed_at);
        const resolutionTimeHours = (closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
        
        if (!resolutionByType[ticket.type_id]) {
          resolutionByType[ticket.type_id] = { totalTime: 0, count: 0, typeName: ticket.type_id };
        }
        
        resolutionByType[ticket.type_id].totalTime += resolutionTimeHours;
        resolutionByType[ticket.type_id].count++;
      }
    });
    
    const resolutionTimeByType = Object.entries(resolutionByType).map(([typeId, data]) => ({
      typeId,
      typeName: data.typeName,
      averageTime: data.count > 0 ? data.totalTime / data.count : 0,
      ticketCount: data.count
    }));
    
    // Closure by assignee
    const closureByAssignee: Record<string, { closedTickets: number, totalTime: number, assigneeName: string }> = {};
    
    ticketsArray.forEach(ticket => {
      if (ticket.assigned_to && (ticket.status === 'resolved' || ticket.status === 'closed')) {
        if (!closureByAssignee[ticket.assigned_to]) {
          closureByAssignee[ticket.assigned_to] = {
            closedTickets: 0,
            totalTime: 0,
            assigneeName: ticket.assigned_to
          };
        }
        
        closureByAssignee[ticket.assigned_to].closedTickets++;
        
        if (ticket.closed_at && ticket.created_at) {
          const createdDate = new Date(ticket.created_at);
          const closedDate = new Date(ticket.closed_at);
          const resolutionTimeHours = (closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
          closureByAssignee[ticket.assigned_to].totalTime += resolutionTimeHours;
        }
      }
    });
    
    const closureByAssigneeArray = Object.entries(closureByAssignee).map(([assigneeId, data]) => ({
      assigneeId,
      assigneeName: data.assigneeName,
      closedTickets: data.closedTickets,
      averageResolutionTime: data.closedTickets > 0 ? data.totalTime / data.closedTickets : 0
    }));
    
    // Ticket spikes - identifies abnormal increases in ticket count
    const ticketSpikes = [];
    let previousCount = 0;
    
    for (let i = 1; i < ticketTrends.length; i++) {
      const currentPoint = ticketTrends[i];
      const previousPoint = ticketTrends[i-1];
      
      if (previousPoint.raised > 0 && currentPoint.raised > previousPoint.raised) {
        const percentageIncrease = ((currentPoint.raised - previousPoint.raised) / previousPoint.raised) * 100;
        
        if (percentageIncrease > 50) { // Threshold for spike alert
          ticketSpikes.push({
            date: currentPoint.date,
            count: currentPoint.raised,
            percentageIncrease
          });
        }
      }
    }
    
    // Return aggregated data
    return {
      kpis: {
        totalTickets,
        resolvedTickets,
        resolutionRate,
        openTickets,
        firstResponseTime,
        firstResponseSLABreach,
        firstTimeResolution,
        averageResolutionTime,
        resolutionSLABreach,
        reopenCount,
        reopenRate
      },
      priorityDistribution,
      statusDistribution,
      topIssueTypes,
      weekdayDistribution,
      managerTrends,
      ticketTrends,
      resolutionByType: resolutionTimeByType,
      closureByAssignee: closureByAssigneeArray,
      ticketSpikes
    };
  } catch (error) {
    console.error("Error fetching ticket trend analytics:", error);
    throw error;
  }
};

// Get list of managers for filtering
export const getManagers = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('manager')
      .not('manager', 'is', null)
      .order('manager');
    
    if (error) {
      console.error("Error fetching managers:", error);
      return [];
    }
    
    // Extract unique manager names
    const managerSet = new Set<string>();
    data?.forEach(item => {
      if (item.manager) {
        managerSet.add(item.manager);
      }
    });
    
    return Array.from(managerSet);
  } catch (error) {
    console.error("Error in getManagers:", error);
    return [];
  }
};

// Get list of roles for filtering
export const getRoles = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('role')
      .not('role', 'is', null)
      .order('role');
    
    if (error) {
      console.error("Error fetching roles:", error);
      return [];
    }
    
    // Extract unique role names
    const roleSet = new Set<string>();
    data?.forEach(item => {
      if (item.role) {
        roleSet.add(item.role);
      }
    });
    
    return Array.from(roleSet);
  } catch (error) {
    console.error("Error in getRoles:", error);
    return [];
  }
};
