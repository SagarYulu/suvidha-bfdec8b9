
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { getIssueById } from "./issueFetchService";
import { createAuditLog } from "./issueAuditService";

/**
 * Create a new issue
 */
export const createIssue = async (issueData: Partial<Issue>): Promise<Issue | null> => {
  try {
    // Generate a UUID for the issue - this is required by the database schema
    const issueId = crypto.randomUUID();
    
    // Map from our Issue type property names to the database column names
    const dbIssueData = {
      id: issueId,
      employee_uuid: issueData.employeeUuid,
      type_id: issueData.typeId,
      sub_type_id: issueData.subTypeId,
      description: issueData.description,
      status: issueData.status || 'open',
      priority: issueData.priority || 'low',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachment_url: issueData.attachmentUrl || null,
      attachments: issueData.attachments || null,
    };

    // Check for required fields
    if (!dbIssueData.employee_uuid || !dbIssueData.type_id || !dbIssueData.sub_type_id || !dbIssueData.description) {
      console.error('Missing required fields for issue creation');
      return null;
    }

    // Use insert([data]) with array syntax
    const { data, error } = await supabase
      .from('issues')
      .insert([dbIssueData])
      .select()
      .single();

    if (error) {
      console.error('Error creating issue:', error);
      throw error;
    }

    // Create audit log for issue creation
    if (data && data.id && dbIssueData.employee_uuid) {
      await createAuditLog(
        data.id,
        dbIssueData.employee_uuid,
        'create',
        { initialData: issueData },
        'Issue created'
      );
    }
    
    // Return the created issue
    return data ? await getIssueById(data.id) : null;
  } catch (error) {
    console.error('Error in createIssue:', error);
    return null;
  }
};
