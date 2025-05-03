
import { supabase } from "@/integrations/supabase/client";

// Helper function to log audit trail
export const logAuditTrail = async (
  issueId: string, 
  employeeUuid: string, 
  action: string, 
  previousStatus?: string, 
  newStatus?: string,
  details?: any
) => {
  try {
    console.log(`Logging audit trail with employee UUID: ${employeeUuid}`);
    
    await supabase.from('issue_audit_trail').insert({
      issue_id: issueId,
      employee_uuid: employeeUuid, // Use the exact UUID passed in
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      details
    });
    
    console.log(`Audit trail logged: ${action} for issue ${issueId} by employee ${employeeUuid}`);
  } catch (error) {
    console.error('Error logging audit trail:', error);
  }
};

export const getAuditTrail = async (issueId: string, limit = 100) => {
  try {
    if (!issueId) {
      console.error('Error: Issue ID is required for fetching audit trail');
      return [];
    }
    
    console.log(`Fetching audit trail for issue ID: ${issueId}`);
    
    const { data, error } = await supabase
      .from('issue_audit_trail')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching audit trail:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getAuditTrail:', error);
    return [];
  }
};
