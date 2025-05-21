
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type TicketFeedback = {
  id?: string;
  issue_id: string;
  employee_uuid: string;
  sentiment: 'happy' | 'neutral' | 'sad';
  feedback_option: string;
  created_at?: string;
};

// Check if feedback already exists for a ticket
export const checkFeedbackExists = async (issueId: string, employeeUuid: string): Promise<boolean> => {
  try {
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
    const { data, error } = await supabase
      .from('ticket_feedback')
      .insert([feedback])
      .select();
    
    if (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
      return false;
    }
    
    toast({
      title: "Success",
      description: "Feedback submitted successfully.",
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
