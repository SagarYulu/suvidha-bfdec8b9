
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
    // Make sure we have a valid issue ID
    if (!issueId) {
      console.error('Error: issueId is required for audit trail');
      return;
    }

    // Convert any non-string employee UUID to string
    let validEmployeeUuid = String(employeeUuid);
    console.log(`Initial employeeUuid provided: "${validEmployeeUuid}"`);
    
    // Check if we have potentially invalid values or placeholder values
    if (!validEmployeeUuid || 
        validEmployeeUuid === 'undefined' || 
        validEmployeeUuid === 'null' ||
        validEmployeeUuid === 'system' || 
        validEmployeeUuid === 'admin-fallback' ||
        validEmployeeUuid === 'security-user-1') {
      
      console.warn(`Warning: Invalid or missing employeeUuid: "${validEmployeeUuid}" for action "${action}". Fetching current user from session.`);
      
      try {
        // Get the current authenticated user
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (session?.user?.id) {
          validEmployeeUuid = session.user.id;
          console.log(`Using authenticated user ID from session: ${validEmployeeUuid}`);
        } else {
          // Look for dashboardUser in localStorage
          const mockUserStr = localStorage.getItem('mockUser');
          if (mockUserStr) {
            try {
              const mockUser = JSON.parse(mockUserStr);
              if (mockUser && mockUser.id) {
                validEmployeeUuid = mockUser.id;
                console.log(`Using mockUser ID from localStorage: ${validEmployeeUuid}`);
              }
            } catch (e) {
              console.error("Error parsing mock user:", e);
            }
          }
          
          // If still no valid ID, look for yuluUser
          if (validEmployeeUuid === 'system' || !validEmployeeUuid) {
            const yuluUserStr = localStorage.getItem('yuluUser');
            if (yuluUserStr) {
              try {
                const yuluUser = JSON.parse(yuluUserStr);
                if (yuluUser && yuluUser.id) {
                  validEmployeeUuid = yuluUser.id;
                  console.log(`Using yuluUser ID from localStorage: ${validEmployeeUuid}`);
                }
              } catch (e) {
                console.error("Error parsing yulu user:", e);
              }
            }
          }
          
          // If still no valid user, use a last resort fallback
          if (validEmployeeUuid === 'system' || !validEmployeeUuid) {
            console.error('No authenticated user found. Using fallback ID.');
            validEmployeeUuid = 'system-fallback';
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        validEmployeeUuid = employeeUuid || 'system-fallback';
      }
    }
    
    console.log(`Final employeeUuid being used for audit: ${validEmployeeUuid}`);

    // Attempt to get dashboard user if it's a special case
    if (validEmployeeUuid === 'admin-uuid-1' || validEmployeeUuid === 'security-user-1') {
      const { data: dashboardUser, error } = await supabase
        .from('dashboard_users')
        .select('id')
        .eq('email', validEmployeeUuid === 'admin-uuid-1' ? 'admin@yulu.com' : 'sagar.km@yulu.bike')
        .maybeSingle();
      
      if (!error && dashboardUser) {
        validEmployeeUuid = dashboardUser.id;
        console.log(`Resolved to actual dashboard user ID: ${validEmployeeUuid}`);
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
