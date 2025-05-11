
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { createAuditLog } from "./issueAuditService";

/**
 * Update the status of an issue
 */
export const updateIssueStatus = async (
  issueId: string,
  newStatus: Issue["status"],
  userId: string
): Promise<Issue | null> => {
  try {
    console.log(`Updating issue status. Issue ID: ${issueId}, New Status: ${newStatus}, Provided UserID: ${userId}`);
    
    // Prepare update data without the last_status_change_at field
    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    
    // If status is closed or resolved, add closed_at
    if (newStatus === 'closed' || newStatus === 'resolved') {
      updateData.closed_at = new Date().toISOString();
    } else {
      // If reopening, remove closed_at
      updateData.closed_at = null;
    }
    
    const { data, error } = await supabase
      .from('issues')
      .update(updateData)
      .eq('id', issueId)
      .select();
      
    if (error) {
      console.error('Error updating issue status:', error);
      throw error;
    }
    
    // Create audit log entry
    await createAuditLog(
      issueId,
      userId,
      'status_change',
      { newStatus },
      'Issue status updated'
    );
    
    // Get the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};

/**
 * Assign an issue to a user
 */
export const assignIssueToUser = async (
  issueId: string,
  assigneeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .update({
        assigned_to: assigneeId,
        updated_at: new Date().toISOString(),
        // If ticket was unassigned, set to in_progress automatically
        status: 'in_progress'
      })
      .eq('id', issueId)
      .select();
      
    if (error) {
      console.error('Error assigning issue:', error);
      throw error;
    }
    
    // Create audit log entry for assignment
    await createAuditLog(
      issueId,
      currentUserId,
      'assignment',
      { assigneeId },
      'Issue assigned to user'
    );
    
    // Return the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error assigning issue:', error);
    throw error;
  }
};

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
