
import { IssueComment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { logAuditTrail } from "./issueAuditService";

export const getCommentsForIssue = async (issueId: string): Promise<IssueComment[]> => {
  try {
    const { data: dbComments, error } = await supabase
      .from('issue_comments')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
    
    return dbComments.map(dbComment => ({
      id: dbComment.id,
      employeeUuid: dbComment.employee_uuid,
      content: dbComment.content,
      createdAt: dbComment.created_at
    }));
  } catch (error) {
    console.error('Error in getCommentsForIssue:', error);
    return [];
  }
};

export const addNewComment = async (
  issueId: string, 
  comment: { 
    employeeUuid: string; 
    content: string;
  }
): Promise<IssueComment | undefined> => {
  try {
    // Validate issueId
    if (!issueId) {
      console.error('Error: issueId is required for adding a comment');
      return undefined;
    }
    
    // Generate UUID for the comment
    const commentId = crypto.randomUUID();
    
    // First check if we have a valid employeeUuid
    let employeeUuid = comment.employeeUuid;
    
    console.log('Initial employeeUuid provided:', employeeUuid);
    
    // If employeeUuid is missing or invalid, try to get the current authenticated user
    if (!employeeUuid || employeeUuid === 'admin-fallback' || employeeUuid === 'system' || employeeUuid === 'security-user-1') {
      console.warn(`Warning: Invalid employeeUuid provided: "${employeeUuid}". Attempting to get current user.`);
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        employeeUuid = session.user.id;
        console.log(`Using authenticated user ID instead: ${employeeUuid}`);
      }
    }
    
    console.log('Final employeeUuid being used:', employeeUuid);
    
    const { data: dbComment, error } = await supabase
      .from('issue_comments')
      .insert({
        id: commentId,
        issue_id: issueId,
        employee_uuid: employeeUuid,
        content: comment.content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return undefined;
    }
    
    // Log audit trail for new comment
    await logAuditTrail(
      issueId,
      employeeUuid, // Use the same UUID we determined above
      'comment_added',
      undefined,
      undefined,
      { comment_id: commentId }
    );
    
    return {
      id: dbComment.id,
      employeeUuid: dbComment.employee_uuid,
      content: dbComment.content,
      createdAt: dbComment.created_at
    };
  } catch (error) {
    console.error('Error in addNewComment:', error);
    return undefined;
  }
};

// Just for backward compatibility
export const addComment = addNewComment;
