
import { supabase } from "@/integrations/supabase/client";

export interface IssueAnalytics {
  totalIssues: number;
  openIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  averageResolutionTime: number;
  issuesByPriority: Record<string, number>;
  issuesByType: Record<string, number>;
  monthlyTrends: Array<{
    month: string;
    count: number;
  }>;
}

export const getAnalytics = async (filters?: {
  startDate?: string;
  endDate?: string;
  employeeUuid?: string;
}): Promise<IssueAnalytics> => {
  try {
    // Build base query
    let query = supabase.from('issues').select('*');
    
    // Apply filters
    if (filters?.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters?.employeeUuid) {
      query = query.eq('employee_uuid', filters.employeeUuid);
    }
    
    const { data: issues, error } = await query;
    
    if (error) {
      console.error('Error fetching analytics data:', error);
      throw error;
    }
    
    // Calculate analytics
    const totalIssues = issues?.length || 0;
    const openIssues = issues?.filter(i => i.status === 'open').length || 0;
    const inProgressIssues = issues?.filter(i => i.status === 'in_progress').length || 0;
    const resolvedIssues = issues?.filter(i => i.status === 'resolved').length || 0;
    const closedIssues = issues?.filter(i => i.status === 'closed').length || 0;
    
    // Calculate average resolution time for closed/resolved issues
    const resolvedOrClosed = issues?.filter(i => 
      (i.status === 'resolved' || i.status === 'closed') && i.closed_at
    ) || [];
    
    const avgResolutionTime = resolvedOrClosed.length > 0 
      ? resolvedOrClosed.reduce((sum, issue) => {
          const created = new Date(issue.created_at);
          const closed = new Date(issue.closed_at);
          return sum + (closed.getTime() - created.getTime());
        }, 0) / resolvedOrClosed.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;
    
    // Group by priority
    const issuesByPriority = issues?.reduce((acc, issue) => {
      acc[issue.priority] = (acc[issue.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Group by type
    const issuesByType = issues?.reduce((acc, issue) => {
      acc[issue.type_id] = (acc[issue.type_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Monthly trends (last 12 months)
    const monthlyTrends = calculateMonthlyTrends(issues || []);
    
    return {
      totalIssues,
      openIssues,
      inProgressIssues,
      resolvedIssues,
      closedIssues,
      averageResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      issuesByPriority,
      issuesByType,
      monthlyTrends
    };
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    throw error;
  }
};

function calculateMonthlyTrends(issues: any[]): Array<{ month: string; count: number }> {
  const trends: Record<string, number> = {};
  
  issues.forEach(issue => {
    const date = new Date(issue.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    trends[monthKey] = (trends[monthKey] || 0) + 1;
  });
  
  // Convert to array and sort
  return Object.entries(trends)
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
