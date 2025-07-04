import { createAuditLog } from "@/services/issues/issueAuditService";
import authenticatedAxios from '@/services/authenticatedAxios';

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
    const response = await authenticatedAxios.get(`/api/issues/${issueId}/internal-comments`);
    
    const data = response.data;
    
    // Map the database response to our InternalComment interface
    return data.map((comment: any) => ({
      id: comment.id,
      issueId: comment.issueId || comment.issue_id,
      employeeUuid: comment.employeeUuid || comment.employee_uuid,
      content: comment.content,
      createdAt: comment.createdAt || comment.created_at
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
    try {
      const dashboardResponse = await fetch(`/api/dashboard-users/${userUuid}`);
      if (dashboardResponse.ok) {
        const dashboardUser = await dashboardResponse.json();
        if (dashboardUser && dashboardUser.name) {
          return {
            name: dashboardUser.name,
            role: dashboardUser.role,
            id: userUuid,
            email: dashboardUser.email
          };
        }
      }
    } catch (error) {
      // Continue to check employees
    }

    // Then check employees
    try {
      const employeeResponse = await fetch(`/api/employees/${userUuid}`);
      if (employeeResponse.ok) {
        const employee = await employeeResponse.json();
        if (employee && employee.name) {
          return {
            name: employee.name,
            role: employee.role,
            id: userUuid,
            email: employee.email
          };
        }
      }
    } catch (error) {
      console.error('Error fetching employee info:', error);
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
    
    const response = await fetch(`/api/issues/${issueId}/internal-comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        employeeUuid,
        content
      }),
    });
    
    if (!response.ok) {
      console.error('Error adding internal comment:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    
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
      issueId: data.issueId || data.issue_id,
      employeeUuid: data.employeeUuid || data.employee_uuid,
      content: data.content,
      createdAt: data.createdAt || data.created_at
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
    const issueResponse = await fetch(`/api/issues/${issueId}`);
    if (!issueResponse.ok) {
      console.log('No issue found for notification');
      return;
    }
    
    const issue = await issueResponse.json();
    if (!issue || !issue.assignedTo) {
      console.log('No assignee found for notification');
      return;
    }
    
    // Don't notify if the commenter is the same as the assignee
    if (issue.assignedTo === commenterId) {
      console.log('Commenter is the assignee, no notification needed');
      return;
    }
    
    // Create notification for the assignee
    const notificationResponse = await fetch('/api/issue-notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: issue.assignedTo,
        issueId,
        content: `${commenterName} added an internal comment to a ticket assigned to you.`,
        isRead: false
      }),
    });
    
    if (!notificationResponse.ok) {
      console.error('Error creating notification:', notificationResponse.statusText);
    } else {
      console.log(`Notification created for assignee ${issue.assignedTo}`);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}