
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type TicketFeedback = {
  id?: string;
  issue_id: string;
  employee_uuid: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedback_option: string;
  feedback_text?: string; // This is used internally but not stored directly
  created_at?: string;
  city?: string;       // Added city
  cluster?: string;    // Added cluster
  agent_id?: string;   // Added agent (who closed the ticket)
  agent_name?: string; // Added agent name
};

// Define a more specific type for the employee data we expect
interface EmployeeData {
  city?: string | null;
  cluster?: string | null;
}

// Check if feedback already exists for a ticket
export const checkFeedbackExists = async (issueId: string, employeeUuid: string): Promise<boolean> => {
  try {
    console.log(`Checking feedback for issue: ${issueId}, employee: ${employeeUuid}`);
    const { data, error } = await supabase
      .from('ticket_feedback')
      .select('id')
      .eq('issue_id', issueId)
      .eq('employee_uuid', employeeUuid)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the "row not found" error
      console.error("Error checking if feedback exists:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking if feedback exists:", error);
    return false;
  }
};

// Get feedback status for a ticket
export const getFeedbackStatus = async (issueId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('ticket_feedback')
      .select('id')
      .eq('issue_id', issueId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is the "row not found" error
      console.error("Error checking feedback status:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking feedback status:", error);
    return false;
  }
};

// Get feedback statuses for multiple tickets
export const getMultipleFeedbackStatuses = async (issueIds: string[]): Promise<Record<string, boolean>> => {
  try {
    if (!issueIds.length) return {};
    
    const { data, error } = await supabase
      .from('ticket_feedback')
      .select('issue_id')
      .in('issue_id', issueIds);
    
    if (error) {
      console.error("Error checking multiple feedback statuses:", error);
      return {};
    }
    
    // Create a map of issue_id -> has feedback
    const feedbackMap: Record<string, boolean> = {};
    
    // Initialize all tickets as not having feedback
    issueIds.forEach(id => {
      feedbackMap[id] = false;
    });
    
    // Update the ones that do have feedback
    if (data) {
      data.forEach(feedback => {
        feedbackMap[feedback.issue_id] = true;
      });
    }
    
    return feedbackMap;
  } catch (error) {
    console.error("Error checking multiple feedback statuses:", error);
    return {};
  }
};

// Submit feedback for a ticket
export const submitTicketFeedback = async (feedback: TicketFeedback): Promise<boolean> => {
  try {
    console.log("Submitting feedback:", feedback);
    
    // Check if feedback already exists
    const feedbackExists = await checkFeedbackExists(feedback.issue_id, feedback.employee_uuid);
    
    if (feedbackExists) {
      console.log("Feedback already exists for this ticket");
      toast({
        title: "Feedback Already Submitted",
        description: "You have already provided feedback for this ticket.",
      });
      return true; // Return true since the feedback is already handled
    }
    
    // Get the issue details to capture city, cluster, and agent information
    const { data: issueData, error: issueError } = await supabase
      .from('issues')
      .select(`
        *,
        employees!issues_employee_uuid_fkey (
          city,
          cluster
        )
      `)
      .eq('id', feedback.issue_id)
      .single();
    
    if (issueError) {
      console.error("Error fetching issue data:", issueError);
    }
    
    // Extract city, cluster, agent ID and agent name information
    let city = feedback.city || undefined;
    let cluster = feedback.cluster || undefined;
    let agentId = feedback.agent_id || undefined;
    let agentName = feedback.agent_name || undefined;
    
    // Use data from the issue if available
    if (issueData && !issueError) {
      // Safely access and extract employee data
      const employees = issueData.employees as EmployeeData | null;
      
      if (employees !== null && employees !== undefined) {
        // Safe access to city
        if (employees.city !== null && employees.city !== undefined) {
          city = city || String(employees.city);
        }
        
        // Safe access to cluster
        if (employees.cluster !== null && employees.cluster !== undefined) {
          cluster = cluster || String(employees.cluster);
        }
      }
      
      // This should be safe as it's directly on the issue
      agentId = issueData.assigned_to || agentId;
      
      // If we have an agent ID but no name, try to get the name from dashboard_users
      if (agentId && !agentName) {
        const { data: agentData, error: agentError } = await supabase
          .from('dashboard_users')
          .select('name')
          .eq('id', agentId)
          .single();
          
        if (!agentError && agentData) {
          agentName = agentData.name;
        }
      }
    }
    
    // Prepare feedback data with additional information
    const feedbackData = {
      issue_id: feedback.issue_id,
      employee_uuid: feedback.employee_uuid,
      sentiment: feedback.sentiment,
      feedback_option: feedback.feedback_text || feedback.feedback_option, // Store the full text here
      city,
      cluster,
      agent_id: agentId,
      agent_name: agentName
    };
    
    console.log("Submitting enriched feedback data:", feedbackData);
    
    // According to the database schema, we store the full text in the feedback_option field
    const { data, error } = await supabase
      .from('ticket_feedback')
      .insert(feedbackData)
      .select();
    
    if (error) {
      console.error("Error submitting feedback:", error);
      
      toast({
        title: "Error",
        description: `Failed to submit feedback: ${error.message}. Please try again.`,
        variant: "destructive",
      });
      return false;
    }
    
    console.log("Feedback submitted successfully:", data);
    toast({
      title: "Success",
      description: "Feedback submitted successfully. Thank you!",
    });
    return true;
  } catch (error) {
    console.error("Error submitting feedback:", error);
    toast({
      title: "Error",
      description: "Failed to submit feedback. Please try again.",
      variant: "destructive",
    });
    return false;
  }
};
