
import { supabase } from '@/integrations/supabase/client';
import { mapDbIssueToAppIssue } from './issueUtils';

export interface IssueFilters {
  city?: string;
  cluster?: string;
  issueType?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export const getIssues = async (filters: IssueFilters = {}): Promise<any[]> => {
  try {
    let query = supabase
      .from('issues')
      .select(`
        *,
        issue_comments(*)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    
    if (filters.cluster) {
      query = query.ilike('cluster', `%${filters.cluster}%`);
    }
    
    if (filters.issueType) {
      query = query.eq('type_id', filters.issueType);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }
    
    if (filters.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }
    
    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom.toISOString());
    }
    
    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo.toISOString());
    }

    const { data: issues, error } = await query;

    if (error) {
      console.error('Error fetching issues:', error);
      return [];
    }

    return issues ? issues.map(mapDbIssueToAppIssue) : [];
  } catch (error) {
    console.error('Error in getIssues:', error);
    return [];
  }
};
