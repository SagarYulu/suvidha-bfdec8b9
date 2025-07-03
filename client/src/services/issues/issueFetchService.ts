
import { Issue } from "@/types";
import { mapDbIssueToAppIssue } from "./issueUtils";
import { processIssues } from "./issueProcessingService";

/**
 * Fetches an issue by its ID
 */
export const getIssueById = async (id: string): Promise<Issue | undefined> => {
  try {
    // Get the issue from the database
    const { data: dbIssue, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching issue by ID:', error);
      return undefined;
    }
    
    // Get comments for this issue
    const { data: comments, error: commentsError } = await supabase
      .from('issue_comments')
      .select('*')
      .eq('issue_id', id)
      .order('created_at', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments for issue:', commentsError);
      return undefined;
    }
    
    // Map comments to the expected format
    const formattedComments = comments ? comments.map(comment => ({
      id: comment.id,
      employeeUuid: comment.employee_uuid,
      content: comment.content,
      createdAt: comment.created_at
    })) : [];
    
    // Map database issue to app Issue type
    return mapDbIssueToAppIssue(dbIssue, formattedComments);
  } catch (error) {
    console.error('Error in getIssueById:', error);
    return undefined;
  }
};

/**
 * Fetches issues for a specific user
 */
export const getIssuesByUserId = async (employeeUuid: string): Promise<Issue[]> => {
  try {
    // Get user issues from the database
    const { data: dbIssues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('employee_uuid', employeeUuid)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user issues:', error);
      return [];
    }
    
    // Process issues with comments and return
    return await processIssues(dbIssues || []);
  } catch (error) {
    console.error('Error in getIssuesByUserId:', error);
    return [];
  }
};

/**
 * Fetches issues assigned to a specific user
 */
export const getAssignedIssues = async (userUuid: string): Promise<Issue[]> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('assigned_to', userUuid);
    
    if (error) {
      console.error('Error fetching assigned issues:', error);
      throw error;
    }
    
    // Transform the raw issues into our Issue type with comments
    return await processIssues(data || []);
  } catch (error) {
    console.error('Error in getAssignedIssues:', error);
    return [];
  }
};
