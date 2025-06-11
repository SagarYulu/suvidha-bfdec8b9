
import { Issue } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { mapDbIssueToAppIssue } from './issueUtils';

export const getIssueById = async (issueId: string): Promise<Issue | null> => {
  try {
    // First try to get from Supabase
    const { data: issueData, error } = await supabase
      .from('issues')
      .select(`
        *,
        issue_comments(*)
      `)
      .eq('id', issueId)
      .single();

    if (error) {
      console.error('Error fetching issue from Supabase:', error);
      return null;
    }

    if (issueData) {
      const mappedIssue = mapDbIssueToAppIssue(issueData);
      
      // Map comments
      if (issueData.issue_comments) {
        mappedIssue.comments = issueData.issue_comments.map((comment: any) => ({
          id: comment.id,
          employeeUuid: comment.employee_uuid,
          content: comment.content,
          createdAt: comment.created_at,
          updatedAt: comment.created_at
        }));
      }

      return mappedIssue;
    }

    return null;
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return null;
  }
};

export const getIssuesByUserId = async (userId: string): Promise<Issue[]> => {
  try {
    const { data: issues, error } = await supabase
      .from('issues')
      .select(`
        *,
        issue_comments(*)
      `)
      .eq('employee_uuid', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user issues:', error);
      return [];
    }

    return issues.map(mapDbIssueToAppIssue);
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};

export const getAssignedIssues = async (assigneeId: string): Promise<Issue[]> => {
  try {
    const { data: issues, error } = await supabase
      .from('issues')
      .select(`
        *,
        issue_comments(*)
      `)
      .eq('assigned_to', assigneeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching assigned issues:', error);
      return [];
    }

    return issues.map(mapDbIssueToAppIssue);
  } catch (error) {
    console.error('Error in getAssignedIssues:', error);
    return [];
  }
};
