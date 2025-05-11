
import { useState } from "react";
import { Issue } from "@/types";
import { updateIssueStatus } from "@/services/issues/issueStatusService";
import { toast } from "@/hooks/use-toast";

export const useIssueStatus = (
  issueId: string | undefined, 
  issue: Issue | null, 
  initialStatus: Issue["status"], 
  currentUserId: string,
  setIssue: (issue: Issue) => void
) => {
  const [status, setStatus] = useState<Issue["status"]>(initialStatus);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

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

  return {
    status,
    setStatus,
    isUpdatingStatus,
    handleStatusChange
  };
};
