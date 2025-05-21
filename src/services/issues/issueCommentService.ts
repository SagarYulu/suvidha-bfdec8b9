
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
      .select('name, role')
      .eq('id', userUuid)
      .single();
    
    if (dashboardUser) {
      return {
        name: dashboardUser.name,
        role: dashboardUser.role,
        id: userUuid
      };
    }

    // Then check employees
    const { data: employee } = await supabase
      .from('employees')
      .select('name, role')
      .eq('id', userUuid)
      .single();
    
    if (employee) {
      return {
        name: employee.name,
        role: employee.role,
        id: userUuid
      };
    }

    return { name: "Unknown User", id: userUuid };
  } catch (error) {
    console.error('Error getting user info for comment:', error);
    return { name: "Unknown User", id: userUuid };
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
    
    // Get user info for audit log
    const userInfo = await getUserInfoForComment(validEmployeeUuid);
    
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
