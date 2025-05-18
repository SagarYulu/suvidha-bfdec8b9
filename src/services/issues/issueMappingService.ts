import { supabase } from "@/integrations/supabase/client";
import { createAuditLog } from "./issueAuditService";
import { Issue } from "@/types";

/**
 * Map an issue of type "others" to a specific ticket type and subtype
 * @param issueId - The ID of the issue to map
 * @param mapperUserId - The ID of the user performing the mapping
 * @param mappedTypeId - The type ID to map the issue to
 * @param mappedSubTypeId - The subtype ID to map the issue to
 * @returns The updated issue data or null if the operation failed
 */
export const mapIssueType = async (
  issueId: string,
  mapperUserId: string,
  mappedTypeId: string,
  mappedSubTypeId: string
): Promise<Issue | null> => {
  try {
    if (!issueId || !mapperUserId || !mappedTypeId || !mappedSubTypeId) {
      console.error('Missing required fields for issue mapping');
      return null;
    }

    // Update the issue with mapping information
    const { data, error } = await supabase
      .from('issues')
      .update({
        mapped_type_id: mappedTypeId,
        mapped_sub_type_id: mappedSubTypeId,
        mapped_at: new Date().toISOString(),
        mapped_by: mapperUserId,
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      console.error('Error mapping issue:', error);
      return null;
    }

    // Create manual audit log entry for the mapping
    await createAuditLog(
      issueId,
      mapperUserId,
      'issue_mapped',
      {
        mappedTypeId,
        mappedSubTypeId
      },
      `Issue mapped to type: ${mappedTypeId}, subtype: ${mappedSubTypeId}`
    );

    // Map the database response to our Issue type
    // Note: Full issue data would typically be fetched after the update
    // with complete comment information, but we'll return what's available
    return data ? {
      id: data.id,
      employeeUuid: data.employee_uuid,
      typeId: data.type_id,
      subTypeId: data.sub_type_id,
      description: data.description,
      status: data.status,
      priority: data.priority,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,
      assignedTo: data.assigned_to,
      comments: [], // Comments would typically be fetched separately
      attachmentUrl: data.attachment_url,
      attachments: data.attachments,
      mappedTypeId: data.mapped_type_id,
      mappedSubTypeId: data.mapped_sub_type_id,
      mappedAt: data.mapped_at,
      mappedBy: data.mapped_by
    } : null;
  } catch (error) {
    console.error('Error in mapIssueType:', error);
    return null;
  }
};

/**
 * Remove the mapping from an issue
 * @param issueId - The ID of the issue to unmap
 * @param mapperUserId - The ID of the user performing the unmapping
 * @returns Boolean indicating success
 */
export const unmapIssueType = async (
  issueId: string,
  mapperUserId: string
): Promise<boolean> => {
  try {
    // Update the issue to remove mapping information
    const { error } = await supabase
      .from('issues')
      .update({
        mapped_type_id: null,
        mapped_sub_type_id: null,
        mapped_at: null,
        // Keep the mapped_by field to track who last modified it
      })
      .eq('id', issueId);

    if (error) {
      console.error('Error unmapping issue:', error);
      return false;
    }

    // Create audit log entry for the unmapping
    await createAuditLog(
      issueId,
      mapperUserId,
      'issue_unmapped',
      {},
      'Issue mapping removed'
    );

    return true;
  } catch (error) {
    console.error('Error in unmapIssueType:', error);
    return false;
  }
};

/**
 * Get all issues that have been mapped (for analytics purposes)
 */
export const getMappedIssues = async (): Promise<Issue[]> => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .not('mapped_type_id', 'is', null);

    if (error) {
      console.error('Error fetching mapped issues:', error);
      return [];
    }

    // Convert database records to Issue objects
    return data.map(record => ({
      id: record.id,
      employeeUuid: record.employee_uuid,
      typeId: record.type_id,
      subTypeId: record.sub_type_id,
      description: record.description,
      status: record.status,
      priority: record.priority,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      closedAt: record.closed_at,
      assignedTo: record.assigned_to,
      comments: [], // Comments would typically be fetched separately
      attachmentUrl: record.attachment_url,
      attachments: record.attachments,
      mappedTypeId: record.mapped_type_id,
      mappedSubTypeId: record.mapped_sub_type_id,
      mappedAt: record.mapped_at,
      mappedBy: record.mapped_by
    }));
  } catch (error) {
    console.error('Error in getMappedIssues:', error);
    return [];
  }
};

// Export a function to get the effective type and subtype of an issue
// This should be used in analytics to ensure we count the mapped type when available
export const getEffectiveIssueType = (issue: Issue): { typeId: string, subTypeId: string } => {
  return {
    typeId: issue.mappedTypeId || issue.typeId,
    subTypeId: issue.mappedSubTypeId || issue.subTypeId
  };
};
