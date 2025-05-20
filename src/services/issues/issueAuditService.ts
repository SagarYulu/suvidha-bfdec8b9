
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

// Adding a new export for the function referenced in other files
export const createAuditLog = async (
  issueId: string,
  employeeUuid: string,
  action: string,
  details?: Record<string, any>,
  description?: string
) => {
  try {
    // Extract previous and new status from details if status_change action
    const previousStatus = action === 'status_change' ? details?.previousStatus : null;
    const newStatus = action === 'status_change' ? details?.newStatus : null;

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
      console.error("Error creating audit log:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in createAuditLog:", error);
    return false;
  }
};

// Re-export logAuditTrail for backward compatibility
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

// Alias for getIssueAuditTrail to fix import errors
export const getAuditTrail = getIssueAuditTrail;
