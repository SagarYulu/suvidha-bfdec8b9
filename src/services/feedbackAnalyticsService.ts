
import { supabase } from "@/integrations/supabase/client";
import { format, subDays, subWeeks, subMonths, subQuarters, subYears } from "date-fns";

export type FeedbackSentiment = 'happy' | 'neutral' | 'sad';

export interface FeedbackItem {
  id: string;
  issue_id: string;
  employee_uuid: string;
  sentiment: FeedbackSentiment;
  feedback_option: string;
  created_at: string;
}

export interface FeedbackMetrics {
  totalCount: number;
  sentimentCounts: Record<FeedbackSentiment, number>;
  sentimentPercentages: Record<FeedbackSentiment, number>;
  topOptions: Array<{ option: string; count: number; sentiment: FeedbackSentiment }>;
  trendData: Array<{ date: string; happy: number; neutral: number; sad: number; total: number }>;
}

export interface FeedbackFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  sentiment?: FeedbackSentiment;
  employeeUuid?: string;
  comparisonMode?: 'none' | 'dod' | 'wow' | 'mom' | 'qoq' | 'yoy';
}

// Helper to get comparison date based on mode
export const getComparisonDate = (date: Date, mode: string): Date => {
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
      created_at
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
  
  // For city and cluster filters, we need to join with the issues table
  // and then with employees table to filter by city or cluster
  if (filters.city || filters.cluster) {
    // First get issues filtered by city/cluster through employees
    let issuesQuery = supabase.from('issues')
      .select('id')
      .eq('status', 'closed');
    
    if (filters.city || filters.cluster) {
      // Get employees matching city/cluster criteria
      let employeesQuery = supabase.from('employees').select('emp_id');
      
      if (filters.city) {
        employeesQuery = employeesQuery.eq('city', filters.city);
      }
      
      if (filters.cluster) {
        employeesQuery = employeesQuery.eq('cluster', filters.cluster);
      }
      
      const { data: employees } = await employeesQuery;
      
      if (employees && employees.length > 0) {
        const employeeIds = employees.map(e => e.emp_id);
        issuesQuery = issuesQuery.in('employee_uuid', employeeIds);
      } else {
        // No employees match the criteria, return empty result
        return [];
      }
    }
    
    const { data: filteredIssues } = await issuesQuery;
    
    if (filteredIssues && filteredIssues.length > 0) {
      const issueIds = filteredIssues.map(issue => issue.id);
      query = query.in('issue_id', issueIds);
    } else {
      // No issues match the criteria, return empty result
      return [];
    }
  }
  
  // Order by created_at to ensure consistent results
  query = query.order('created_at', { ascending: false });
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching feedback data:', error);
    throw error;
  }
  
  return data || [];
};

// Calculate metrics from feedback data
export const calculateFeedbackMetrics = (feedbackData: FeedbackItem[]): FeedbackMetrics => {
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
      sentimentCounts[item.sentiment as FeedbackSentiment]++;
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
      optionCounts[option] = { count: 0, sentiment: item.sentiment as FeedbackSentiment };
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
    
    trendDataMap[date][item.sentiment as FeedbackSentiment]++;
    trendDataMap[date].total++;
  });
  
  // Convert trend data to array and sort by date
  const trendData = Object.entries(trendDataMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  return {
    totalCount,
    sentimentCounts,
    sentimentPercentages,
    topOptions,
    trendData
  };
};

// Fetch comparison data based on current filters and comparison mode
export const fetchComparisonData = async (
  filters: FeedbackFilters
): Promise<{ current: FeedbackMetrics; previous: FeedbackMetrics | null }> => {
  // If no comparison mode or no date range, just return current data
  if (filters.comparisonMode === 'none' || !filters.startDate || !filters.endDate) {
    const currentData = await fetchFeedbackData(filters);
    const currentMetrics = calculateFeedbackMetrics(currentData);
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
  const previousFilters = {
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
  const currentMetrics = calculateFeedbackMetrics(currentData);
  const previousMetrics = calculateFeedbackMetrics(previousData);
  
  return {
    current: currentMetrics,
    previous: previousMetrics
  };
};
