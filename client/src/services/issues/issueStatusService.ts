
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { logAuditTrail } from "./issueAuditService";

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
    
    // Get current issue to capture the previous status
    const currentIssue = await getIssueById(issueId);
    const previousStatus = currentIssue?.status || 'unknown';
    
    // Get performer info (the person changing the status)
    const { data: performerData } = await supabase
      .from('dashboard_users')
      .select('name, role')
      .eq('id', userId)
      .single();
    
    const performerInfo = {
      name: performerData?.name || "Unknown User",
      role: performerData?.role,
      id: userId
    };
    
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
    
    // Create audit log entry with performer info
    await logAuditTrail(
      issueId,
      Number(userId),
      'status_change',
      previousStatus,
      newStatus,
      { 
        performer: performerInfo
      }
    );
    
    // Get the complete updated issue
    return await getIssueById(issueId);
  } catch (error) {
    console.error('Error updating issue status:', error);
    throw error;
  }
};
