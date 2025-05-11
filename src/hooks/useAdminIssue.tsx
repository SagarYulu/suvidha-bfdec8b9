
import { useState, useEffect } from "react";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types";
import { 
  getIssueById, 
  updateIssueStatus, 
  assignIssueToUser, 
  addComment,
  reopenTicket 
} from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { getAvailableAssignees, getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const useAdminIssue = (issueId?: string) => {
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Issue["status"]>("open");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [availableAssignees, setAvailableAssignees] = useState<{ value: string; label: string }[]>([]);
  const [currentAssigneeId, setCurrentAssigneeId] = useState<string | null>(null);
  const [currentAssigneeName, setCurrentAssigneeName] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [reopenReason, setReopenReason] = useState<string>("");
  const [isReopeningTicket, setIsReopeningTicket] = useState(false);
  const [showReopenDialog, setShowReopenDialog] = useState(false);

  const currentUserId = authState.user?.id || "";

  useEffect(() => {
    const fetchIssueDetails = async () => {
      if (!issueId) return;

      setIsLoading(true);
      try {
        const issueData = await getIssueById(issueId);
        if (issueData) {
          setIssue(issueData);
          setStatus(issueData.status);
          
          // Fetch employee information
          if (issueData.employeeUuid) {
            const employeeData = await getUserById(issueData.employeeUuid);
            if (employeeData) {
              setEmployee(employeeData);
            }
          }
          
          // Fetch assignee information
          if (issueData.assignedTo) {
            setCurrentAssigneeId(issueData.assignedTo);
            const assigneeName = await getEmployeeNameByUuid(issueData.assignedTo);
            setCurrentAssigneeName(assigneeName || "Unknown");
          }
          
          // Get commenter names
          const uniqueCommenterIds = Array.from(new Set(issueData.comments.map(c => c.employeeUuid)));
          const names: Record<string, string> = {};
          
          for (const commenterId of uniqueCommenterIds) {
            const name = await getEmployeeNameByUuid(commenterId);
            names[commenterId] = name || "Unknown";
          }
          
          // Add current user to the names list for future comments
          if (currentUserId && !names[currentUserId]) {
            const currentUserName = authState.user?.name || "Current User";
            names[currentUserId] = currentUserName;
          }
          
          setCommenterNames(names);
          
          // Fetch available assignees
          const assignees = await getAvailableAssignees();
          setAvailableAssignees(assignees);
        }
      } catch (error) {
        console.error("Error fetching issue details:", error);
        toast({
          title: "Error",
          description: "Failed to load ticket details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId, authState.user, currentUserId]);

  const handleStatusChange = async (newStatus: Issue["status"]) => {
    if (!issueId || !issue || status === newStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const updatedIssue = await updateIssueStatus(issueId, newStatus, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(newStatus);
        toast({
          title: "Success",
          description: `Ticket status updated to ${newStatus.replace("_", " ")}`,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssignIssue = async () => {
    if (!issueId || !selectedAssignee || !currentUserId) return;
    
    setIsAssigning(true);
    try {
      const updatedIssue = await assignIssueToUser(issueId, selectedAssignee, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setCurrentAssigneeId(selectedAssignee);
        
        const assigneeName = await getEmployeeNameByUuid(selectedAssignee);
        setCurrentAssigneeName(assigneeName || "Unknown");
        
        toast({
          title: "Success",
          description: `Ticket assigned to ${assigneeName || "selected agent"}`,
        });
      }
    } catch (error) {
      console.error("Error assigning issue:", error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
      setSelectedAssignee("");
    }
  };

  const handleAddComment = async () => {
    if (!issueId || !newComment.trim() || !currentUserId) return;
    
    setIsSubmittingComment(true);
    try {
      const updatedIssue = await addComment(issueId, newComment, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setNewComment("");
        toast({
          title: "Success",
          description: "Comment added",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Display dialog for reopening ticket
  const handleReopenTicket = () => {
    setShowReopenDialog(true);
  };
  
  // Process the actual reopening with reason
  const processReopenTicket = async () => {
    if (!issueId || !currentUserId || !reopenReason.trim()) return;
    
    setIsReopeningTicket(true);
    try {
      const updatedIssue = await reopenTicket(issueId, reopenReason, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(updatedIssue.status);
        setShowReopenDialog(false);
        setReopenReason("");
        toast({
          title: "Success",
          description: "Ticket reopened successfully",
        });
      }
    } catch (error) {
      console.error("Error reopening ticket:", error);
      toast({
        title: "Error",
        description: "Failed to reopen ticket",
        variant: "destructive",
      });
    } finally {
      setIsReopeningTicket(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return {
    issue,
    employee,
    isLoading,
    newComment,
    setNewComment,
    isSubmittingComment,
    status,
    isUpdatingStatus,
    commenterNames,
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    handleAssignIssue,
    handleStatusChange,
    handleAddComment,
    handleReopenTicket,
    formatDate,
    currentUserId,
    // Reopen dialog properties
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
