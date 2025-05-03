
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
    
    // Determine a valid employee UUID
    let validEmployeeUuid = comment.employeeUuid;
    
    console.log('Initial employeeUuid provided:', validEmployeeUuid);
    
    // If employeeUuid is missing or appears to be invalid, try to get the current authenticated user
    if (!validEmployeeUuid || 
        validEmployeeUuid === 'admin-fallback' || 
        validEmployeeUuid === 'system' || 
        validEmployeeUuid === 'security-user-1' ||
        validEmployeeUuid === '') {
      
      console.warn(`Potentially invalid employeeUuid provided: "${validEmployeeUuid}". Fetching current user from session.`);
      
      // Get the current authenticated user directly from session
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session?.user?.id) {
        validEmployeeUuid = session.user.id;
        console.log(`Using authenticated user ID from session: ${validEmployeeUuid}`);
      } else {
        console.error('No authenticated user found in session');
      }
    }
    
    console.log('Final employeeUuid being used:', validEmployeeUuid);
    
    // Insert the comment with validated employee UUID
    const { data: dbComment, error } = await supabase
      .from('issue_comments')
      .insert({
        id: commentId,
        issue_id: issueId,
        employee_uuid: validEmployeeUuid,
        content: comment.content
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return undefined;
    }
    
    // Log audit trail for new comment using the same validated UUID
    await logAuditTrail(
      issueId,
      validEmployeeUuid,
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
