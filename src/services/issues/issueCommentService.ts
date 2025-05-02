
import { IssueComment } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getIssueById } from "./issueService";
import { logAuditTrail } from "./issueAuditService";

// Helper function to convert app IssueComment to database format
const mapAppCommentToDbComment = (comment: Omit<IssueComment, 'id' | 'createdAt'>, issueId: string) => {
  return {
    issue_id: issueId,
    employee_uuid: comment.employeeUuid,
    content: comment.content
  };
};

export const addComment = async (issueId: string, comment: Omit<IssueComment, 'id' | 'createdAt'>): Promise<any> => {
  try {
    // Insert comment into the database
    const { data: dbComment, error } = await supabase
      .from('issue_comments')
      .insert(mapAppCommentToDbComment(comment, issueId))
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error);
      return undefined;
    }
    
    // Update issue's updatedAt timestamp
    const { error: updateError } = await supabase
      .from('issues')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', issueId);
    
    if (updateError) {
      console.error('Error updating issue timestamp:', updateError);
    }
    
    // Log audit trail for adding comment
    await logAuditTrail(
      issueId,
      comment.employeeUuid,
      'comment_added',
      undefined,
      undefined,
      { comment_id: dbComment.id }
    );
    
    // Return the updated issue with all comments
    return getIssueById(issueId);
  } catch (error) {
    console.error('Error in addComment:', error);
    return undefined;
  }
};

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
    
    // Map database comments to app IssueComment type
    return dbComments.map(comment => ({
      id: comment.id,
      employeeUuid: comment.employee_uuid,
      content: comment.content,
      createdAt: comment.created_at
    }));
  } catch (error) {
    console.error('Error in getCommentsForIssue:', error);
    return [];
  }
};
