
import { supabase } from "@/integrations/supabase/client";

export const getIssueAuditTrail = async (issueId: string) => {
  try {
    const { data, error } = await supabase
      .from('issue_audit_trail')
      .select('*')
      .eq('issue_id', issueId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching audit trail:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      issueId: item.issue_id,
      employeeUuid: item.employee_uuid,
      action: item.action,
      previousStatus: item.previous_status,
      newStatus: item.new_status,
      details: item.details,
      createdAt: item.created_at
    }));
  } catch (error) {
    console.error("Error in getIssueAuditTrail:", error);
    return [];
  }
};

export const logAuditTrail = async (
  issueId: string,
  employeeUuid: string,
  action: string,
  previousStatus?: string,
  newStatus?: string,
  details?: Record<string, any>
) => {
  try {
    const { data, error } = await supabase
      .from('issue_audit_trail')
      .insert({
        issue_id: issueId,
        employee_uuid: employeeUuid,
        action,
        previous_status: previousStatus,
        new_status: newStatus,
        details
      });
    
    if (error) {
      console.error("Error logging audit trail:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in logAuditTrail:", error);
    return false;
  }
};
