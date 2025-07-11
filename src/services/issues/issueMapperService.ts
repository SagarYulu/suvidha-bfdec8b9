
import { supabase } from "@/integrations/supabase/client";
import { Issue } from "@/types";
import { createAuditLog } from "./issueAuditService";
import { toast } from "@/hooks/use-toast";

/**
 * Maps an "Others" ticket to a different ticket type and subtype
 */
export const mapIssueType = async (
  issueId: string,
  newTypeId: string,
  newSubTypeId: string,
  currentUserId: string
): Promise<Issue | null> => {
  try {
    if (!issueId || !newTypeId || !newSubTypeId) {
      console.error("Missing required parameters for mapping issue type");
      return null;
    }

    // Get the current issue to verify it exists and get its current values
    const { data: currentIssue, error: fetchError } = await supabase
      .from("issues")
      .select("*")
      .eq("id", issueId)
      .single();

    if (fetchError || !currentIssue) {
      console.error("Error fetching current issue:", fetchError);
      return null;
    }

    // Update the issue with mapped type values
    const { data, error } = await supabase
      .from("issues")
      .update({
        mapped_type_id: newTypeId,
        mapped_sub_type_id: newSubTypeId,
        mapped_at: new Date().toISOString(),
        mapped_by: currentUserId
      })
      .eq("id", issueId)
      .select();

    if (error) {
      console.error("Error mapping issue type:", error);
      return null;
    }

    // Create audit log for the mapping action
    await createAuditLog(
      issueId,
      currentUserId,
      "issue_mapped",
      {
        previous: {
          type_id: currentIssue.type_id,
          sub_type_id: currentIssue.sub_type_id
        },
        new: {
          type_id: newTypeId,
          sub_type_id: newSubTypeId
        }
      },
      `Issue mapped from 'Others' to ${newTypeId}`
    );

    // If we have data, properly convert it to an Issue object
    if (data && data[0]) {
      const dbIssue = data[0];
      
      // Map database fields to Issue type fields
      const issue: Issue = {
        id: dbIssue.id,
        employeeUuid: dbIssue.employee_uuid,
        typeId: dbIssue.type_id,
        subTypeId: dbIssue.sub_type_id,
        description: dbIssue.description,
        status: dbIssue.status as "open" | "in_progress" | "resolved" | "closed",
        priority: dbIssue.priority as "low" | "medium" | "high" | "critical",
        createdAt: dbIssue.created_at,
        updatedAt: dbIssue.updated_at,
        closedAt: dbIssue.closed_at,
        assignedTo: dbIssue.assigned_to,
        attachmentUrl: dbIssue.attachment_url,
        attachments: dbIssue.attachments,
        comments: [], // Comments will be populated separately
        // Add mapped fields
        mappedTypeId: dbIssue.mapped_type_id,
        mappedSubTypeId: dbIssue.mapped_sub_type_id,
        mappedAt: dbIssue.mapped_at,
        mappedBy: dbIssue.mapped_by
      };

      return issue;
    }

    return null;
  } catch (error) {
    console.error("Error in mapIssueType:", error);
    return null;
  }
};

/**
 * Check if an issue is eligible for mapping (is an 'Others' type ticket)
 */
export const isIssueMappable = (issue: Issue | null): boolean => {
  if (!issue) return false;
  return issue.typeId === "others";
};
