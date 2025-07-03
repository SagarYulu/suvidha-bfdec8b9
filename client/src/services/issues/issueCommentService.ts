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

// Get user info for audit logs
async function getUserInfoForComment(userUuid: string) {
  try {
    // Check dashboard users first
    const { data: dashboardUser } = await supabase
      .from('dashboard_users')
      .select('name, role, email')
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

    // Then check employees
    const { data: employee } = await supabase
      .from('employees')
      .select('name, role, email')
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

    console.log(`Could not find user info for comment UUID: ${userUuid}`);
    return { name: "Unknown User", id: userUuid };
  } catch (error) {
    console.error('Error getting user info for comment:', error);
    return { name: "Unknown User", id: userUuid };
  }
}

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
        content: `${commenterName} added a comment to a ticket assigned to you.`,
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
    
    console.log('Initial employeeUuid provided for comment:', validEmployeeUuid);
    
    // If employeeUuid is missing or appears to be invalid, try to get the current authenticated user
    if (!validEmployeeUuid || 
        validEmployeeUuid === 'undefined' || 
        validEmployeeUuid === 'null' ||
        validEmployeeUuid === 'admin-fallback' || 
        validEmployeeUuid === 'system' || 
        validEmployeeUuid === '') {
      
      console.warn(`Potentially invalid employeeUuid provided: "${validEmployeeUuid}". Checking alternatives.`);
      
      // First check for mockUser in localStorage
      const mockUserStr = localStorage.getItem('mockUser');
      if (mockUserStr) {
        try {
          const mockUser = JSON.parse(mockUserStr);
          if (mockUser && mockUser.id) {
            validEmployeeUuid = mockUser.id;
            console.log(`Using mockUser ID from localStorage: ${validEmployeeUuid}`);
          }
        } catch (e) {
          console.error("Error parsing mock user:", e);
        }
      }
      
      // If still invalid, check for yuluUser
      if (validEmployeeUuid === 'system' || !validEmployeeUuid) {
        const yuluUserStr = localStorage.getItem('yuluUser');
        if (yuluUserStr) {
          try {
            const yuluUser = JSON.parse(yuluUserStr);
            if (yuluUser && yuluUser.id) {
              validEmployeeUuid = yuluUser.id;
              console.log(`Using yuluUser ID from localStorage: ${validEmployeeUuid}`);
            }
          } catch (e) {
            console.error("Error parsing yulu user:", e);
          }
        }
      }
      
      // If still invalid, try to get from Supabase session
      if (validEmployeeUuid === 'system' || !validEmployeeUuid) {
        // Get the current authenticated user directly from session
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (session?.user?.id) {
          validEmployeeUuid = session.user.id;
          console.log(`Using authenticated user ID from session: ${validEmployeeUuid}`);
        }
      }
      
      // If still not valid, use a fallback
      if (!validEmployeeUuid || validEmployeeUuid === 'system') {
        console.error('No authenticated user found for comment');
      }
    }
    
    console.log('Final employeeUuid being used for comment:', validEmployeeUuid);
    
    // Get user info for audit log with enhanced retrieval
    const userInfo = await getUserInfoForComment(validEmployeeUuid);
    console.log(`User info retrieved for comment: ${userInfo.name}`);
    
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
    
    // Create notification for the assignee
    await createNotificationForAssignee(issueId, validEmployeeUuid, userInfo.name);
    
    // Log audit trail for new comment using the same validated UUID
    await logAuditTrail(
      issueId,
      validEmployeeUuid,
      'comment_added',
      undefined,
      undefined,
      { 
        comment_id: commentId,
        performer: userInfo
      }
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
