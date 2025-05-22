
import { supabase } from "@/integrations/supabase/client";
import { createAuditLog } from "@/services/issues/issueAuditService";

export interface InternalComment {
  id: string;
  issueId: string;
  employeeUuid: string;
  content: string;
  createdAt: string;
}

// Fetch internal comments for a ticket
export const getInternalComments = async (issueId: string): Promise<InternalComment[]> => {
  try {
    const { data, error } = await supabase
      .from('issue_internal_comments')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching internal comments:', error);
      return [];
    }
    
    // Map the database response to our InternalComment interface
    return data.map(comment => ({
      id: comment.id,
      issueId: comment.issue_id,
      employeeUuid: comment.employee_uuid,
      content: comment.content,
      createdAt: comment.created_at
    }));
  } catch (error) {
    console.error('Error in getInternalComments:', error);
    return [];
  }
};

// Get user info for audit logs
async function getUserInfo(userUuid: string) {
  try {
    // Check dashboard users first with more comprehensive query
    const { data: dashboardUser, error: dashboardError } = await supabase
      .from('dashboard_users')
      .select('id, name, role, email')
      .eq('id', userUuid)
      .single();
    
    if (dashboardUser && dashboardUser.name) {
      return {
        name: dashboardUser.name,
        role: dashboardUser.role,
        id: userUuid,
        email: dashboardUser.email
      };
    }

    // Then check employees with more comprehensive query
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, name, role, email')
      .eq('id', userUuid)
      .single();
    
    if (employee && employee.name) {
      return {
        name: employee.name,
        role: employee.role,
        id: userUuid,
        email: employee.email
      };
    }

    console.log(`Could not find user info for UUID: ${userUuid}`);
    return { name: "Unknown User", id: userUuid };
  } catch (error) {
    console.error('Error getting user info:', error);
    return { name: "Unknown User", id: userUuid };
  }
}

// Add a new internal comment to a ticket
export const addInternalComment = async (
  issueId: string, 
  employeeUuid: string, 
  content: string
): Promise<InternalComment | null> => {
  try {
    // Ensure we have valid user information
    const userInfo = await getUserInfo(employeeUuid);
    
    // Generate UUID for the comment
    const commentId = crypto.randomUUID();
    
    const { data, error } = await supabase
      .from('issue_internal_comments')
      .insert([
        { 
          id: commentId,
          issue_id: issueId, 
          employee_uuid: employeeUuid, 
          content 
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding internal comment:', error);
      return null;
    }
    
    console.log(`Added internal comment by ${userInfo.name} (${employeeUuid})`);
    
    // Create audit log entry with detailed performer info
    await createAuditLog(
      issueId,
      employeeUuid,
      'internal_comment_added',
      { 
        commentId: data.id,
        performer: userInfo
      },
      `Internal comment added by ${userInfo.name}`
    );
    
    // Create notification for the assignee
    await createNotificationForAssignee(issueId, employeeUuid, userInfo.name);
    
    // Map the database response to our InternalComment interface
    return {
      id: data.id,
      issueId: data.issue_id,
      employeeUuid: data.employee_uuid,
      content: data.content,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error in addInternalComment:', error);
    return null;
  }
};

// Create notification for assignee when a comment is added
async function createNotificationForAssignee(issueId: string, commenterId: string, commenterName: string) {
  try {
    // First, get the issue to find the assignee
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('assigned_to')
      .eq('id', issueId)
      .single();
    
    if (issueError || !issue || !issue.assigned_to) {
      console.log('No assignee found for notification');
      return;
    }
    
    // Don't notify if the commenter is the same as the assignee
    if (issue.assigned_to === commenterId) {
      console.log('Commenter is the assignee, no notification needed');
      return;
    }
    
    // Create notification for the assignee
    const { error: notifError } = await supabase
      .from('issue_notifications')
      .insert({
        user_id: issue.assigned_to,
        issue_id: issueId,
        content: `${commenterName} added an internal comment to a ticket assigned to you.`,
        is_read: false
      });
    
    if (notifError) {
      console.error('Error creating notification:', notifError);
    } else {
      console.log(`Notification created for assignee ${issue.assigned_to}`);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}
