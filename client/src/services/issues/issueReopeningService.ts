
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { createAuditLog } from "./issueAuditService";

/**
 * Reopen a closed or resolved ticket
 */
export const reopenTicket = async (
  issueId: string, 
  reopenReason: string,
  userId: string
): Promise<Issue | null> => {
  try {
    // Update the issue to open status and add reopen reason
    const { data, error } = await supabase
      .from('issues')
      .update({
        status: 'open',
        closed_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', issueId)
      .select();
      
    if (error) {
      console.error('Error reopening ticket:', error);
      throw error;
    }
    
    // Create a comment with the reopen reason
    const reopenComment = {
      issue_id: issueId,
      employee_uuid: userId,
      content: `Ticket reopened. Reason: ${reopenReason}`,
      created_at: new Date().toISOString()
    };
    
    const { error: commentError } = await supabase
      .from('issue_comments')
      .insert([reopenComment]);
    
    if (commentError) {
      console.error('Error adding reopen comment:', commentError);
    }
    
    // Create audit log entry
    await createAuditLog(
      issueId,
      userId,
      'reopen',
      { reason: reopenReason },
      'Issue reopened'
    );
    
    // Return the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error reopening ticket:', error);
    throw error;
  }
};
