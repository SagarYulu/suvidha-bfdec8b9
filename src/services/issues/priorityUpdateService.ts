
import { supabase } from "@/integrations/supabase/client";
import { determinePriority, shouldSendNotification, getNotificationRecipients } from "@/utils/workingTimeUtils";
import { Issue } from "@/types";
import { toast } from "@/components/ui/use-toast";
import { useEffect } from "react";

/**
 * Updates the priority of a single ticket based on its current state
 */
export const updateIssuePriority = async (issue: Issue): Promise<Issue | null> => {
  try {
    // Skip closed or resolved issues
    if (issue.status === 'closed' || issue.status === 'resolved') {
      return issue;
    }
    
    // Determine the new priority based on working time calculations
    const newPriority = determinePriority(
      issue.createdAt,
      issue.updatedAt,
      issue.status,
      issue.typeId,
      issue.assignedTo
    );
    
    console.log(`Calculated priority for issue ${issue.id}: ${newPriority} (current: ${issue.priority})`);
    
    // If priority has changed, update the issue
    if (newPriority !== issue.priority) {
      console.log(`Updating priority for issue ${issue.id} from ${issue.priority} to ${newPriority}`);
      
      // Make sure we're only updating with valid priority values that match the database constraint
      if (!['low', 'medium', 'high', 'critical'].includes(newPriority)) {
        console.error(`Invalid priority value: ${newPriority}`);
        return issue;
      }
      
      // Update the issue in the database
      const { data, error } = await supabase
        .from('issues')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', issue.id)
        .select();
      
      if (error) {
        console.error('Error updating issue priority:', error);
        toast({
          title: "Error",
          description: `Failed to update priority for ticket ${issue.id}`,
          variant: "destructive",
        });
        return null;
      }
      
      // Check if notifications should be sent
      if (shouldSendNotification(issue.priority, newPriority)) {
        const recipients = getNotificationRecipients(newPriority, issue.assignedTo);
        
        // Create notifications for each recipient
        for (const recipient of recipients) {
          await createIssueNotification(
            issue.id,
            recipient,
            `Ticket priority escalated to ${newPriority.toUpperCase()}`
          );
        }
      }
      
      // Return the updated issue with the new priority
      const updatedIssue: Issue = {
        ...issue,
        priority: newPriority,
        updatedAt: new Date().toISOString()
      };
      
      return updatedIssue;
    }
    
    return issue;
  } catch (error) {
    console.error('Error in updateIssuePriority:', error);
    toast({
      title: "Error",
      description: `An error occurred during priority update`,
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Creates a notification for a ticket
 */
const createIssueNotification = async (
  issueId: string,
  userId: string,
  content: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('issue_notifications')
      .insert({
        issue_id: issueId,
        user_id: userId,
        content,
        is_read: false
      });
    
    if (error) {
      console.error('Error creating issue notification:', error);
    }
  } catch (error) {
    console.error('Error in createIssueNotification:', error);
  }
};

/**
 * Updates priorities for all active issues
 */
export const updateAllIssuePriorities = async (): Promise<void> => {
  try {
    console.log("Starting updateAllIssuePriorities()");
    // Fetch all active issues (not closed or resolved)
    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .in('status', ['open', 'in_progress']);
    
    if (error) {
      console.error('Error fetching issues for priority update:', error);
      return;
    }
    
    console.log(`Found ${issues.length} active issues to check for priority updates`);
    
    // Process each issue
    for (const dbIssue of issues) {
      // Convert to app Issue format
      const issue: Issue = {
        id: dbIssue.id,
        employeeUuid: dbIssue.employee_uuid,
        typeId: dbIssue.type_id,
        subTypeId: dbIssue.sub_type_id,
        description: dbIssue.description,
        status: dbIssue.status as Issue["status"],
        priority: dbIssue.priority as Issue["priority"],
        createdAt: dbIssue.created_at,
        updatedAt: dbIssue.updated_at,
        closedAt: dbIssue.closed_at,
        assignedTo: dbIssue.assigned_to,
        comments: [] // Comments not needed for priority calculation
      };
      
      // Update the priority
      await updateIssuePriority(issue);
    }
    
    console.log("Completed updateAllIssuePriorities()");
    toast({
      title: "Success",
      description: "Ticket priorities have been updated",
    });
  } catch (error) {
    console.error('Error in updateAllIssuePriorities:', error);
    toast({
      title: "Error",
      description: "Failed to update ticket priorities",
      variant: "destructive",
    });
  }
};

/**
 * Hook to initialize priority checking on client-side
 * This would typically be called from a component that's always mounted
 */
export const usePriorityUpdater = (intervalMinutes: number = 15) => {
  useEffect(() => {
    // Initial update with a delay to ensure component is fully mounted
    console.log('Initializing priority updater');
    
    // Use setTimeout to delay the initial update slightly to ensure components are mounted
    const initialTimeoutId = setTimeout(() => {
      updateAllIssuePriorities();
    }, 2000); // Increased delay to 2 seconds
    
    // Set interval for periodic updates
    const intervalId = setInterval(() => {
      console.log('Running scheduled priority update');
      updateAllIssuePriorities();
    }, intervalMinutes * 60 * 1000);
    
    // Clean up on unmount
    return () => {
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  }, [intervalMinutes]);
};
