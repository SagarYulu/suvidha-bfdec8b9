
import { useIssueDetails } from "./issues/useIssueDetails";
import { useIssueAssignment } from "./issues/useIssueAssignment";
import { useIssueStatus } from "./issues/useIssueStatus";
import { useIssueComments } from "./issues/useIssueComments";
import { useIssueReopen } from "./issues/useIssueReopen";
import { useState, useEffect } from "react";
import { getIssueAuditTrail } from "@/services/issues/issueAuditService";

export const useAdminIssue = (issueId?: string) => {
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  // Get core issue details
  const {
    issue,
    setIssue,
    employee,
    isLoading,
    commenterNames,
    status,
    setStatus,
    formatDate,
    currentUserId
  } = useIssueDetails(issueId);
  
  // Handle issue assignment
  const {
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    handleAssignIssue
  } = useIssueAssignment(issue, currentUserId, setIssue);
  
  // Handle issue status management
  const {
    isUpdatingStatus,
    handleStatusChange
  } = useIssueStatus(issueId, issue, status, currentUserId, setIssue);
  
  // Handle issue comments
  const {
    newComment,
    setNewComment,
    isSubmittingComment,
    handleAddComment,
    handleAddPrivateComment
  } = useIssueComments(issueId, currentUserId, setIssue);
  
  // Handle issue reopening
  const {
    reopenReason,
    setReopenReason,
    isReopeningTicket,
    showReopenDialog,
    setShowReopenDialog,
    handleReopenTicket,
    processReopenTicket,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
  } = useIssueReopen(issueId, currentUserId, setIssue, setStatus);

  // Load audit trail
  useEffect(() => {
    const loadAuditTrail = async () => {
      if (!issueId) return;
      
      try {
        const trail = await getIssueAuditTrail(issueId);
        setAuditTrail(trail);
      } catch (error) {
        console.error("Failed to load audit trail:", error);
        setAuditTrail([]);
      }
    };
    
    loadAuditTrail();
  }, [issueId]);

  // Determine if current user is assignee or assigner
  const isCurrentUserAssignee = issue?.assignedTo === currentUserId;
  const isCurrentUserAssigner = issue?.employeeUuid === currentUserId;

  // Create a wrapper for the private comment handler that returns void instead of boolean
  const handleAddPrivateCommentVoid = async (message: string): Promise<void> => {
    await handleAddPrivateComment(message);
  };

  // Combine and return all the hooks' values and functions
  return {
    // Issue details
    issue,
    setIssue,
    employee,
    isLoading,
    commenterNames,
    status,
    auditTrail,
    
    // Comments
    newComment,
    setNewComment,
    isSubmittingComment,
    
    // Status
    isUpdatingStatus,
    
    // Assignment
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    
    // User roles
    isCurrentUserAssignee,
    isCurrentUserAssigner,
    
    // Actions
    handleAssignIssue,
    handleStatusChange,
    handleAddComment,
    handleAddPrivateComment: handleAddPrivateCommentVoid,
    handleReopenTicket,
    formatDate,
    currentUserId,
    
    // Reopen dialog properties and state
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    showReopenDialog,
    setShowReopenDialog,
    reopenReason,
    setReopenReason,
    isReopeningTicket,
    processReopenTicket
  };
};
