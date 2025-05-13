import { supabase } from "@/integrations/supabase/client";
import { determinePriority, shouldSendNotification, getNotificationRecipients } from "@/utils/workingTimeUtils";
import { Issue } from "@/types";
import { toast } from "@/hooks/use-toast";
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
    
    // Validate that the issue ID exists
    if (!issue.id) {
      console.error('Cannot update priority: Missing issue ID');
      return issue;
    }
    
    // Determine the new priority based on working time calculations
    // Critical 16-hour rule is applied for ANY ticket not closed/resolved
    const newPriority = determinePriority(
      issue.createdAt,
      issue.updatedAt,
      issue.status,
      issue.typeId,
      issue.assignedTo
    );
    
    // Ensure the priority is one of the allowed values - Now including 'critical'
    const validPriorities: Issue["priority"][] = ['low', 'medium', 'high', 'critical'];
    const validPriority = validPriorities.includes(newPriority as Issue["priority"]) 
      ? newPriority as Issue["priority"] 
      : 'high';
    
    console.log(`Calculated priority for issue ${issue.id}: ${validPriority} (current: ${issue.priority})`);
    
    // If priority hasn't changed, return the original issue
    if (validPriority === issue.priority) {
      return issue;
    }
    
    console.log(`Updating priority for issue ${issue.id} from ${issue.priority} to ${validPriority}`);
    
    // Check if this is an escalation to critical due to the 16-hour rule
    const isCriticalEscalation = validPriority === 'critical' && issue.priority !== 'critical';
    
    // Update the issue in the database
    const { data, error } = await supabase
      .from('issues')
      .update({ 
        priority: validPriority,
        updated_at: new Date().toISOString()
      })
      .eq('id', issue.id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating priority for issue ${issue.id}:`, error);
      // If we hit a constraint error, log it but don't fail
      if (error.code === '23514') {
        console.warn(`Priority "${validPriority}" not allowed by constraint. This should not happen as the database has been updated.`);
      }
      return issue;
    }
    
    console.log(`Successfully updated priority for issue ${issue.id} to ${validPriority}`);
    
    // Check if notifications should be sent
    if (shouldSendNotification(issue.priority, validPriority)) {
      const recipients = getNotificationRecipients(validPriority, issue.assignedTo);
      
      // For 16-hour critical escalation, add additional notification content
      const notificationContent = isCriticalEscalation 
        ? `URGENT: Ticket priority escalated to CRITICAL - Unresolved for 16+ working hours`
        : `Ticket priority escalated to ${validPriority.toUpperCase()}`;
      
      // Create notifications for each recipient
      for (const recipient of recipients) {
        await createIssueNotification(
          issue.id,
          recipient,
          notificationContent
        );
      }
    }
    
    // Return the updated issue with the new priority
    return {
      ...issue,
      priority: validPriority,
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in updateIssuePriority:', error);
    return issue;
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
      toast({
        title: "Error",
        description: "Failed to fetch tickets for priority update",
        variant: "destructive",
      });
      return;
    }
    
    if (!issues || issues.length === 0) {
      console.log('No active issues found to update priorities');
      toast({
        title: "Success",
        description: "All tickets are already at the correct priority",
      });
      return;
    }
    
    console.log(`Found ${issues.length} active issues to check for priority updates`);
    
    // Add a small delay to ensure DB consistency
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let successCount = 0;
    let failedIssues = [];
    
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
        updatedAt: dbIssue.updated_at || dbIssue.created_at, // Use created_at if updated_at is null
        closedAt: dbIssue.closed_at,
        assignedTo: dbIssue.assigned_to,
        comments: [] // Comments not needed for priority calculation
      };
      
      // Update the priority
      try {
        const result = await updateIssuePriority(issue);
        if (result && result.priority !== issue.priority) {
          successCount++;
          console.log(`Successfully updated priority for issue ${issue.id} to ${result.priority}`);
        }
      } catch (err) {
        console.error(`Error updating priority for issue ${issue.id}:`, err);
        failedIssues.push(issue.id);
      }
      
      // Add a small delay between updates to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`Completed updateAllIssuePriorities(): ${successCount} updated, ${failedIssues.length} errors`);
    
    // Show toast based on results
    if (failedIssues.length > 0) {
      toast({
        title: failedIssues.length === issues.length ? "Error" : "Partial Success",
        description: failedIssues.length === issues.length
          ? `Failed to update ticket priorities`
          : `Updated ${successCount} tickets, encountered ${failedIssues.length} errors`,
        variant: "destructive",
      });
    } else if (successCount > 0) {
      toast({
        title: "Success",
        description: `Ticket priorities have been updated (${successCount} changed)`,
      });
    } else {
      toast({
        title: "Success",
        description: "All tickets are already at the correct priority",
      });
    }
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
    
    // Use setTimeout to delay the initial update to ensure components are mounted
    const initialTimeoutId = setTimeout(() => {
      updateAllIssuePriorities();
    }, 7000); // Increased delay to 7 seconds
    
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
