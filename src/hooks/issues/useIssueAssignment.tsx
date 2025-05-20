
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
        
        // Fetch available assignees first to ensure we have the dropdown data
        const assignees = await getAvailableAssignees();
        console.log("Available assignees:", assignees);
        setAvailableAssignees(assignees);
        
        // Fetch assignee information if issue has one
        if (issue?.assignedTo) {
          setCurrentAssigneeId(issue.assignedTo);
          console.log("Issue is assigned to:", issue.assignedTo);
          
          // Try to find assignee in dropdown first for immediate display
          const matchedAssignee = assignees.find(a => a.value === issue.assignedTo);
          
          if (matchedAssignee) {
            console.log("Found assignee in dropdown:", matchedAssignee.label);
            setCurrentAssigneeName(matchedAssignee.label);
          } else {
            // Fall back to lookup if not in dropdown
            const assigneeName = await getEmployeeNameByUuid(issue.assignedTo);
            console.log("Resolved assignee name via lookup:", assigneeName);
            setCurrentAssigneeName(assigneeName || "Unknown User");
          }
        } else {
          console.log("Issue has no assignee");
          setCurrentAssigneeId(null);
          setCurrentAssigneeName("Not assigned");
        }
      } catch (error) {
        console.error("Error fetching assignee information:", error);
        setCurrentAssigneeName("Error retrieving assignee");
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
      
      // Find the assignee name from our dropdown options for immediate UI update
      const selectedAssigneeName = availableAssignees.find(a => a.value === selectedAssignee)?.label;
      console.log("Selected assignee name from dropdown:", selectedAssigneeName);
        
      const updatedIssue = await assignIssueToUser(issue.id, selectedAssignee, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setCurrentAssigneeId(selectedAssignee);
        
        if (selectedAssigneeName) {
          setCurrentAssigneeName(selectedAssigneeName);
          console.log("Set assignee name immediately to:", selectedAssigneeName);
        } else {
          // Fallback to lookup
          const assigneeName = await getEmployeeNameByUuid(selectedAssignee);
          setCurrentAssigneeName(assigneeName || "Unknown User");
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
