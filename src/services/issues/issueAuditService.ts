
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
    // Make sure we have a valid employee UUID and the issueId exists
    if (!issueId) {
      console.error('Error: issueId is required for audit trail');
      return;
    }

    // Try to get a valid user ID if the provided one seems problematic
    let validEmployeeUuid = employeeUuid;
    
    // Check if we have potentially invalid values
    if (!validEmployeeUuid || 
        validEmployeeUuid === 'system' || 
        validEmployeeUuid === 'admin-fallback' || 
        validEmployeeUuid === 'security-user-1') {
      
      console.warn(`Warning: Invalid or missing employeeUuid: "${employeeUuid}" for action "${action}". Fetching current user from session.`);
      
      // Get the current authenticated user from Supabase session (async)
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      
      if (session?.user?.id) {
        validEmployeeUuid = session.user.id;
        console.log(`Using authenticated user ID from session: ${validEmployeeUuid}`);
      } else {
        // If still no valid user, use a last resort fallback
        console.error('No authenticated user found in session. Using fallback ID.');
        validEmployeeUuid = employeeUuid || 'system-fallback';
      }
    }

    // Insert the audit trail entry with the validated employee UUID
    const { data, error } = await supabase.from('issue_audit_trail').insert({
      issue_id: issueId,
      employee_uuid: validEmployeeUuid,
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      details
    });
    
    if (error) {
      console.error('Error inserting audit trail:', error);
      return;
    }
    
    console.log(`Audit trail logged: ${action} for issue ${issueId} by user ${validEmployeeUuid}`);
  } catch (error) {
    console.error('Error logging audit trail:', error);
  }
};

export const getAuditTrail = async (issueId?: string, limit = 100) => {
  try {
    let query = supabase
      .from('issue_audit_trail')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (issueId) {
      query = query.eq('issue_id', issueId);
    }
    
    const { data, error } = await query;
    
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
