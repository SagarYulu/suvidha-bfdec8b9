import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type TicketFeedback = {
  id?: string;
  issue_id: string;
  employee_uuid: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedback_option: string;
  feedback_text?: string; // Only keeping English text
  created_at?: string;
};

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
    
    // We now have permissive RLS policies that allow anyone to submit feedback
    const { data, error } = await supabase
      .from('ticket_feedback')
      .insert({
        issue_id: feedback.issue_id,
        employee_uuid: feedback.employee_uuid,
        sentiment: feedback.sentiment,
        feedback_option: feedback.feedback_option,
        feedback_text: feedback.feedback_text || null // Only store English text
      })
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
