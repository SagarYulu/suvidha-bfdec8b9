import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subWeeks, subMonths, subQuarters, subYears } from "date-fns";
import { ComparisonMode } from "@/components/admin/sentiment/ComparisonModeDropdown";

export type FeedbackSentiment = 'happy' | 'neutral' | 'sad';

export interface FeedbackItem {
  id: string;
  issue_id: string;
  employee_uuid: string;
  sentiment: FeedbackSentiment;
  feedback_option: string;
  created_at: string;
  city?: string;
  cluster?: string;
  agent_id?: string;
  agent_name?: string; // Added agent name
}

// Add interface for hierarchical chart data
export interface SubReasonItem {
  id: string;
  name: string;
  value: number;
  sentiment: string;
  percentage: number;
  sentimentIndex: number;
}

export interface SentimentGroup {
  id: string;
  name: string;
  value: number;
  percentage: number;
  color: string;
  subReasons: SubReasonItem[];
}

export interface AgentFeedbackStats {
  agentId: string;
  agentName: string;
  closedTickets: number;
  receivedFeedback: number;
  feedbackPercentage: number;
}

export interface FeedbackMetrics {
  totalCount: number;
  sentimentCounts: Record<FeedbackSentiment, number>;
  sentimentPercentages: Record<FeedbackSentiment, number>;
  topOptions: Array<{ option: string; count: number; sentiment: FeedbackSentiment }>;
  trendData: Array<{ date: string; happy: number; neutral: number; sad: number; total: number }>;
  insightData?: Array<{ label: string; value: string; change: number }>;
  hierarchyData?: SentimentGroup[]; // Add hierarchical data structure for visualization
  totalClosedTickets?: number; // Total closed tickets count
  feedbackSubmissionRate?: number; // % of feedback against closed tickets
  agentStats?: AgentFeedbackStats[]; // Agent-wise feedback stats
}

export interface FeedbackFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  sentiment?: FeedbackSentiment;
  employeeUuid?: string;
  agentId?: string; // Agent who closed the ticket
  agentName?: string; // Agent name for filtering
  comparisonMode?: ComparisonMode;
}

// Helper to get comparison date based on mode
export const getComparisonDate = (date: Date, mode: ComparisonMode): Date => {
  switch (mode) {
    case 'dod': return subDays(date, 1);
    case 'wow': return subWeeks(date, 1);
    case 'mom': return subMonths(date, 1);
    case 'qoq': return subQuarters(date, 1);
    case 'yoy': return subYears(date, 1);
    default: return date;
  }
};

// Fetch feedback data with filters
export const fetchFeedbackData = async (filters: FeedbackFilters): Promise<FeedbackItem[]> => {
  console.log("Fetching feedback data with filters:", filters);
  
  let query = supabase
    .from('ticket_feedback')
    .select(`
      id,
      issue_id,
      employee_uuid,
      sentiment,
      feedback_option,
      created_at,
      city,
      cluster,
      agent_id,
      agent_name
    `);
  
  // Apply date filters if provided
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
  
  if (filters.endDate) {
    // Add one day to include the end date fully
    const nextDay = new Date(filters.endDate);
    nextDay.setDate(nextDay.getDate() + 1);
    query = query.lt('created_at', nextDay.toISOString());
  }
  
  // Apply sentiment filter if provided
  if (filters.sentiment) {
    query = query.eq('sentiment', filters.sentiment);
  }
  
  // Apply employee filter if provided
  if (filters.employeeUuid) {
    query = query.eq('employee_uuid', filters.employeeUuid);
  }
  
  // Apply city filter directly if provided
  if (filters.city) {
    query = query.eq('city', filters.city);
  }
  
  // Apply cluster filter directly if provided
  if (filters.cluster) {
    query = query.eq('cluster', filters.cluster);
  }
  
  // Apply agent filter directly if provided
  if (filters.agentId) {
    query = query.eq('agent_id', filters.agentId);
  }
  
  // Apply agent name filter if provided
  if (filters.agentName) {
    query = query.eq('agent_name', filters.agentName);
  }
  
  // Order by created_at to ensure consistent results
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching feedback data:', error);
    throw error;
  }
  
  if (!data || data.length === 0) {
    console.log("No feedback data found for the given filters");
    return [];
  }
  
  console.log(`Found ${data.length} feedback items`);
  
  // Process and validate the data to ensure it conforms to FeedbackItem type
  return data.map(item => {
    // Validate that sentiment is one of the allowed values
    let validSentiment: FeedbackSentiment = 'neutral';
    if (item && typeof item === 'object' && 'sentiment' in item) {
      const sentimentValue = item.sentiment as string;
      if (sentimentValue === 'happy' || sentimentValue === 'sad' || sentimentValue === 'neutral') {
        validSentiment = sentimentValue as FeedbackSentiment;
      }
    }
    
    // Cast the item to the expected type
    return {
      id: String(item.id || ''),
      issue_id: String(item.issue_id || ''),
      employee_uuid: String(item.employee_uuid || ''),
      sentiment: validSentiment,
      feedback_option: String(item.feedback_option || ''),
      created_at: String(item.created_at || ''),
      city: item.city ? String(item.city) : undefined,
      cluster: item.cluster ? String(item.cluster) : undefined,
      agent_id: item.agent_id ? String(item.agent_id) : undefined,
      agent_name: item.agent_name ? String(item.agent_name) : undefined
    } as FeedbackItem;
  });
};

// Fetch closed tickets count for the given time period and filters
export const fetchClosedTicketsCount = async (filters: FeedbackFilters): Promise<number> => {
  try {
    let query = supabase
      .from('issues')
      .select('id', { count: 'exact' })
      .eq('status', 'closed');
    
    // Apply date filters if provided
    if (filters.startDate) {
      query = query.gte('closed_at', filters.startDate);
    }
    
    if (filters.endDate) {
      // Add one day to include the end date fully
      const nextDay = new Date(filters.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      query = query.lt('closed_at', nextDay.toISOString());
    }
    
    // Apply city filter if provided
    if (filters.city) {
      // For issues, we need to join with employees table to filter by city
      // In this simplified version, we'll just count all closed tickets
      // In a real implementation, you'd need to join with the employees table
    }
    
    // Apply cluster filter if provided
    if (filters.cluster) {
      // Similar to city filter, we'd need to join with employees table
    }
    
    // Apply agent filter if provided
    if (filters.agentId) {
      query = query.eq('assigned_to', filters.agentId);
    }
    
    const { count, error } = await query;
    
    if (error) {
      console.error('Error fetching closed tickets count:', error);
      throw error;
    }
    
    return count || 0;
  } catch (err) {
    console.error('Error in fetchClosedTicketsCount:', err);
    return 0;
  }
};

// Fetch agent-wise statistics
export const fetchAgentFeedbackStats = async (filters: FeedbackFilters): Promise<AgentFeedbackStats[]> => {
  try {
    // First, fetch all agents who have closed tickets in the selected period
    let agentQuery = supabase
      .from('issues')
      .select(`
        assigned_to,
        id
      `)
      .eq('status', 'closed')
      .not('assigned_to', 'is', null);
    
    // Apply date filters if provided
    if (filters.startDate) {
      agentQuery = agentQuery.gte('closed_at', filters.startDate);
    }
    
    if (filters.endDate) {
      // Add one day to include the end date fully
      const nextDay = new Date(filters.endDate);
      nextDay.setDate(nextDay.getDate() + 1);
      agentQuery = agentQuery.lt('closed_at', nextDay.toISOString());
    }
    
    // Apply city filter if provided
    if (filters.city) {
      // In a real implementation, you'd need to join with the employees table
      // This is simplified for now
    }
    
    // Apply cluster filter if provided
    if (filters.cluster) {
      // Similar to city filter
    }
    
    const { data: closedTicketsData, error: closedTicketsError } = await agentQuery;
    
    if (closedTicketsError) {
      console.error('Error fetching agent closed tickets:', closedTicketsError);
      throw closedTicketsError;
    }
    
    if (!closedTicketsData || closedTicketsData.length === 0) {
      return [];
    }
    
    // Group closed tickets by agent
    const agentClosedTickets: Record<string, number> = {};
    closedTicketsData.forEach(item => {
      if (item.assigned_to) {
        if (!agentClosedTickets[item.assigned_to]) {
          agentClosedTickets[item.assigned_to] = 0;
        }
        agentClosedTickets[item.assigned_to]++;
      }
    });
    
    // Now fetch feedback data
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('ticket_feedback')
      .select(`
        agent_id,
        agent_name,
        issue_id
      `)
      .not('agent_id', 'is', null);
    
    if (feedbackError) {
      console.error('Error fetching feedback data for agents:', feedbackError);
      throw feedbackError;
    }
    
    // Group feedback by agent
    const agentFeedbacks: Record<string, { count: number, name: string }> = {};
    feedbackData?.forEach(item => {
      if (item.agent_id) {
        if (!agentFeedbacks[item.agent_id]) {
          agentFeedbacks[item.agent_id] = { count: 0, name: item.agent_name || 'Unknown Agent' };
        }
        agentFeedbacks[item.agent_id].count++;
      }
    });
    
    // Fetch agent names for agents without feedback
    const agentIds = Object.keys(agentClosedTickets);
    const missingNameAgents = agentIds.filter(id => !agentFeedbacks[id] || !agentFeedbacks[id].name);
    
    if (missingNameAgents.length > 0) {
      const { data: agentData, error: agentError } = await supabase
        .from('dashboard_users')
        .select('id, name')
        .in('id', missingNameAgents);
      
      if (!agentError && agentData) {
        agentData.forEach(agent => {
          if (!agentFeedbacks[agent.id]) {
            agentFeedbacks[agent.id] = { count: 0, name: agent.name };
          } else if (!agentFeedbacks[agent.id].name) {
            agentFeedbacks[agent.id].name = agent.name;
          }
        });
      }
    }
    
    // Combine the data
    const stats: AgentFeedbackStats[] = agentIds.map(agentId => {
      const closedTickets = agentClosedTickets[agentId] || 0;
      const receivedFeedback = agentFeedbacks[agentId]?.count || 0;
      const feedbackPercentage = closedTickets > 0 ? (receivedFeedback / closedTickets) * 100 : 0;
      
      return {
        agentId,
        agentName: agentFeedbacks[agentId]?.name || 'Unknown Agent',
        closedTickets,
        receivedFeedback,
        feedbackPercentage
      };
    });
    
    // Sort by feedback percentage (highest first)
    return stats.filter(stat => stat.closedTickets > 0) // Only include agents with closed tickets
              .sort((a, b) => b.feedbackPercentage - a.feedbackPercentage);
    
  } catch (err) {
    console.error('Error in fetchAgentFeedbackStats:', err);
    return [];
  }
};

// Calculate metrics from feedback data
export const calculateFeedbackMetrics = async (feedbackData: FeedbackItem[], filters: FeedbackFilters): Promise<FeedbackMetrics> => {
  const totalCount = feedbackData.length;
  
  // Initialize sentiment counts
  const sentimentCounts: Record<FeedbackSentiment, number> = {
    happy: 0,
    neutral: 0,
    sad: 0
  };
  
  // Count by sentiment
  feedbackData.forEach(item => {
    if (item.sentiment in sentimentCounts) {
      sentimentCounts[item.sentiment]++;
    }
  });
  
  // Calculate percentages
  const sentimentPercentages: Record<FeedbackSentiment, number> = {
    happy: totalCount ? Math.round((sentimentCounts.happy / totalCount) * 100) : 0,
    neutral: totalCount ? Math.round((sentimentCounts.neutral / totalCount) * 100) : 0,
    sad: totalCount ? Math.round((sentimentCounts.sad / totalCount) * 100) : 0
  };
  
  // Count feedback options
  const optionCounts: Record<string, { count: number; sentiment: FeedbackSentiment }> = {};
  
  feedbackData.forEach(item => {
    const option = item.feedback_option;
    if (!optionCounts[option]) {
      optionCounts[option] = { count: 0, sentiment: item.sentiment };
    }
    optionCounts[option].count++;
  });
  
  // Convert to array and sort
  const topOptions = Object.entries(optionCounts)
    .map(([option, { count, sentiment }]) => ({ option, count, sentiment }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Get top 10
  
  // Generate trend data (by day)
  const trendDataMap: Record<string, { happy: number; neutral: number; sad: number; total: number }> = {};
  
  feedbackData.forEach(item => {
    const date = format(new Date(item.created_at), 'yyyy-MM-dd');
    
    if (!trendDataMap[date]) {
      trendDataMap[date] = { happy: 0, neutral: 0, sad: 0, total: 0 };
    }
    
    trendDataMap[date][item.sentiment]++;
    trendDataMap[date].total++;
  });
  
  // Convert trend data to array and sort by date
  const trendData = Object.entries(trendDataMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Fetch total closed tickets count
  const totalClosedTickets = await fetchClosedTicketsCount(filters);
  
  // Calculate feedback submission rate
  const feedbackSubmissionRate = totalClosedTickets > 0 ? (totalCount / totalClosedTickets) * 100 : 0;
  
  // Fetch agent-wise stats
  const agentStats = await fetchAgentFeedbackStats(filters);
  
  // Generate key insight metrics
  const insightData = [
    {
      label: "Response Rate",
      value: `${totalCount} responses`,
      change: 0 // Will be calculated in comparison
    },
    {
      label: "Happy Sentiment",
      value: `${sentimentPercentages.happy}%`,
      change: 0
    },
    {
      label: "Neutral Sentiment",
      value: `${sentimentPercentages.neutral}%`,
      change: 0
    },
    {
      label: "Negative Sentiment",
      value: `${sentimentPercentages.sad}%`,
      change: 0
    },
    {
      label: "Feedback Submission Rate",
      value: `${feedbackSubmissionRate.toFixed(1)}%`,
      change: 0
    }
  ];
  
  return {
    totalCount,
    sentimentCounts,
    sentimentPercentages,
    topOptions,
    trendData,
    insightData,
    totalClosedTickets,
    feedbackSubmissionRate,
    agentStats
  };
};

// Fetch comparison data based on current filters and comparison mode
export const fetchComparisonData = async (
  filters: FeedbackFilters
): Promise<{ current: FeedbackMetrics; previous: FeedbackMetrics | null }> => {
  // If no comparison mode or no date range, just return current data
  if (filters.comparisonMode === 'none' || !filters.startDate || !filters.endDate) {
    const currentData = await fetchFeedbackData(filters);
    const currentMetrics = await calculateFeedbackMetrics(currentData, filters);
    return { current: currentMetrics, previous: null };
  }
  
  // Get current period data
  const currentData = await fetchFeedbackData(filters);
  
  // Calculate start and end dates for previous period
  const startDate = new Date(filters.startDate);
  const endDate = new Date(filters.endDate);
  
  // Calculate the duration of the period in milliseconds
  const periodDuration = endDate.getTime() - startDate.getTime();
  
  // Get comparison dates based on mode
  const previousEndDate = getComparisonDate(startDate, filters.comparisonMode);
  const previousStartDate = new Date(previousEndDate.getTime() - periodDuration);
  
  // Create new filters for previous period
  const previousFilters: FeedbackFilters = {
    ...filters,
    startDate: format(previousStartDate, 'yyyy-MM-dd'),
    endDate: format(previousEndDate, 'yyyy-MM-dd'),
    comparisonMode: 'none' // Prevent infinite recursion
  };
  
  console.log('Comparison date ranges:', {
    current: { start: filters.startDate, end: filters.endDate },
    previous: { start: previousFilters.startDate, end: previousFilters.endDate }
  });
  
  // Get previous period data
  const previousData = await fetchFeedbackData(previousFilters);
  
  // Calculate metrics
  const currentMetrics = await calculateFeedbackMetrics(currentData, filters);
  const previousMetrics = await calculateFeedbackMetrics(previousData, previousFilters);
  
  // Calculate changes for insights
  if (currentMetrics.insightData && previousMetrics.totalCount > 0) {
    // Update change percentages
    currentMetrics.insightData[0].change = ((currentMetrics.totalCount - previousMetrics.totalCount) / previousMetrics.totalCount) * 100;
    
    // Happy sentiment change
    currentMetrics.insightData[1].change = currentMetrics.sentimentPercentages.happy - previousMetrics.sentimentPercentages.happy;
    
    // Neutral sentiment change
    currentMetrics.insightData[2].change = currentMetrics.sentimentPercentages.neutral - previousMetrics.sentimentPercentages.neutral;
    
    // Sad sentiment change
    currentMetrics.insightData[3].change = currentMetrics.sentimentPercentages.sad - previousMetrics.sentimentPercentages.sad;
    
    // Feedback submission rate change
    if (currentMetrics.insightData[4] && previousMetrics.feedbackSubmissionRate !== undefined) {
      currentMetrics.insightData[4].change = currentMetrics.feedbackSubmissionRate! - previousMetrics.feedbackSubmissionRate;
    }
  }
  
  return {
    current: currentMetrics,
    previous: previousMetrics
  };
};
