
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
    // Make sure we have a valid employee UUID
    if (!employeeUuid || employeeUuid === 'system' || employeeUuid === 'admin-fallback') {
      console.warn(`Warning: Invalid or missing employeeUuid: "${employeeUuid}" for action "${action}". Using current user.`);
      // Try to get the current authenticated user from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        employeeUuid = session.user.id;
        console.log(`Using authenticated user ID instead: ${employeeUuid}`);
      }
    }

    await supabase.from('issue_audit_trail').insert({
      issue_id: issueId,
      employee_uuid: employeeUuid,
      action,
      previous_status: previousStatus,
      new_status: newStatus,
      details
    });
    
    console.log(`Audit trail logged: ${action} for issue ${issueId} by user ${employeeUuid}`);
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
