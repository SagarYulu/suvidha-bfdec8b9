
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
    const { data, error } = await supabase
      .from('issue_internal_comments')
      .insert([
        { issue_id: issueId, employee_uuid: employeeUuid, content }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding internal comment:', error);
      return null;
    }
    
    // Get commenter info for audit log
    const userInfo = await getUserInfo(employeeUuid);
    
    // Create audit log entry
    await createAuditLog(
      issueId,
      employeeUuid,
      'internal_comment_added',
      { 
        commentId: data.id,
        performer: userInfo
      }
    );
    
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
