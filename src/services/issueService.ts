// This file is a facade that re-exports from the modularized services
// This maintains backwards compatibility while allowing a cleaner structure

// Re-export types
import { IssueFilters } from "./issues/issueFilters";
export type { IssueFilters };

// Re-export all the functions from the modular services
export { 
  getIssueById,
  getIssuesByUserId,
  createIssue,
  updateIssueStatus,
  assignIssueToUser,
  getAssignedIssues,
  reopenTicket,
  updateIssuePriority,
  updateAllIssuePriorities
} from "./issues/issueCore";

export {
  getIssues
} from "./issues/issueFilters";

export { 
  getIssueTypeLabel, 
  getIssueSubTypeLabel 
} from "./issues/issueTypeHelpers";

export { 
  addNewComment as addComment 
} from "./issues/issueCommentService";

export { 
  getAnalytics
} from "./issues/issueAnalyticsService";

export {
  getEmployeeNameByUuid,
  mapEmployeeUuidsToNames
} from "./issues/issueUtils";

// Export the formatting utilities
export {
  formatConsistentIssueData,
  processIssues
} from "./issues/issueProcessingService";

// Export the new mapping functions
export {
  mapIssueType,
  unmapIssueType,
  getEffectiveIssueType
} from "./issues/issueMappingService";

// Update the reopenTicket function to accept a status parameter
export const reopenTicket = async (
  issueId: string, 
  currentUserId: string, 
  newStatus: Issue["status"] = "open"
): Promise<Issue | null> => {
  try {
    // Update the issue status to reopen the ticket
    const { data, error } = await supabase
      .from('issues')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select('*')
      .single();

    if (error) {
      console.error('Error reopening ticket:', error);
      return null;
    }

    // Log the action to the audit trail
    await logAuditTrail(
      issueId,
      currentUserId,
      'ticket_reopened',
      data.status,
      newStatus
    );

    // Return the updated issue
    return {
      id: data.id,
      employeeUuid: data.employee_uuid,
      typeId: data.type_id,
      subTypeId: data.sub_type_id,
      description: data.description,
      status: data.status as Issue["status"],
      priority: data.priority as Issue["priority"],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      closedAt: data.closed_at,
      assignedTo: data.assigned_to,
      comments: [],
      attachmentUrl: data.attachment_url,
      attachments: data.attachments,
      mappedTypeId: data.mapped_type_id,
      mappedSubTypeId: data.mapped_sub_type_id,
      mappedAt: data.mapped_at,
      mappedBy: data.mapped_by
    };
  } catch (error) {
    console.error('Error in reopenTicket:', error);
    return null;
  }
};
