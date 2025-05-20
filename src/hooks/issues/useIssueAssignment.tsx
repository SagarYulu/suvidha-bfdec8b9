
import { useState, useEffect } from "react";
import { Issue } from "@/types";
import { assignIssueToUser } from "@/services/issues/issueAssignmentService";
import { getAvailableAssignees, getEmployeeNameByUuid } from "@/services/issues/issueUtils";
import { toast } from "sonner";

export const useIssueAssignment = (issue: Issue | null, currentUserId: string, setIssue: (issue: Issue) => void) => {
  const [availableAssignees, setAvailableAssignees] = useState<{ value: string; label: string }[]>([]);
  const [currentAssigneeId, setCurrentAssigneeId] = useState<string | null>(null);
  const [currentAssigneeName, setCurrentAssigneeName] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  useEffect(() => {
    const fetchAssigneeInfo = async () => {
      try {
        console.log("Fetching assignee info for issue:", issue?.id);
        // Fetch assignee information if issue has one
        if (issue?.assignedTo) {
          setCurrentAssigneeId(issue.assignedTo);
          console.log("Issue is assigned to:", issue.assignedTo);
          const assigneeName = await getEmployeeNameByUuid(issue.assignedTo);
          console.log("Resolved assignee name:", assigneeName);
          setCurrentAssigneeName(assigneeName || "Unknown");
        } else {
          console.log("Issue has no assignee");
          setCurrentAssigneeId(null);
          setCurrentAssigneeName("Not assigned");
        }
        
        // Fetch available assignees
        const assignees = await getAvailableAssignees();
        console.log("Available assignees:", assignees);
        setAvailableAssignees(assignees);
      } catch (error) {
        console.error("Error fetching assignee information:", error);
      }
    };

    if (issue) {
      fetchAssigneeInfo();
    }
  }, [issue]);

  const handleAssignIssue = async () => {
    if (!issue?.id || !selectedAssignee || !currentUserId) return;
    
    setIsAssigning(true);
    try {
      console.log(`Assigning issue ${issue.id} to ${selectedAssignee}`);
      const updatedIssue = await assignIssueToUser(issue.id, selectedAssignee, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setCurrentAssigneeId(selectedAssignee);
        
        // Find the assignee name from our dropdown options for immediate UI update
        const selectedAssigneeName = availableAssignees.find(a => a.value === selectedAssignee)?.label;
        
        if (selectedAssigneeName) {
          setCurrentAssigneeName(selectedAssigneeName);
          console.log("Set assignee name immediately to:", selectedAssigneeName);
        } else {
          // Fallback to lookup
          const assigneeName = await getEmployeeNameByUuid(selectedAssignee);
          setCurrentAssigneeName(assigneeName || "Unknown");
          console.log("Lookup assignee name:", assigneeName);
        }
        
        toast.success(`Ticket assigned to ${selectedAssigneeName || "selected agent"}`);
      }
    } catch (error) {
      console.error("Error assigning issue:", error);
      toast.error("Failed to assign ticket");
    } finally {
      setIsAssigning(false);
      setSelectedAssignee("");
    }
  };

  return {
    availableAssignees,
    currentAssigneeId,
    currentAssigneeName,
    isAssigning,
    selectedAssignee,
    setSelectedAssignee,
    handleAssignIssue
  };
};
