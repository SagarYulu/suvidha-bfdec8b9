
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getIssueById, 
  updateIssueStatus, 
  assignIssueToUser, 
  addComment, 
  reopenTicket
} from "@/services/issueService";
import { getEmployeeById, getDashboardUsers } from "@/services/userService";
import { Issue, User, IssueComment } from "@/types";
import { toast } from "@/hooks/use-toast";

export const useAdminIssue = (issueId?: string) => {
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [status, setStatus] = useState<Issue["status"]>("open");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const [availableAssignees, setAvailableAssignees] = useState<{id: string, name: string}[]>([]);
  const [currentAssigneeId, setCurrentAssigneeId] = useState<string | null>(null);
  const [currentAssigneeName, setCurrentAssigneeName] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null);
  const [canReopen, setCanReopen] = useState(false);
  const [isReopeningTicket, setIsReopeningTicket] = useState(false);
  const currentUserId = authState.user?.id || null;

  // Check if issue can be reopened
  useEffect(() => {
    if (issue && (issue.status === "closed" || issue.status === "resolved")) {
      if (issue.reopenableUntil) {
        const reopenableDate = new Date(issue.reopenableUntil);
        const now = new Date();
        setCanReopen(now < reopenableDate);
      } else {
        setCanReopen(false);
      }
    } else {
      setCanReopen(false);
    }
  }, [issue]);

  // Fetch issue details
  useEffect(() => {
    const fetchIssueDetails = async () => {
      if (!issueId) return;
      
      setIsLoading(true);
      try {
        const fetchedIssue = await getIssueById(issueId);
        
        if (fetchedIssue) {
          setIssue(fetchedIssue);
          setStatus(fetchedIssue.status);

          if (fetchedIssue.assignedTo) {
            setCurrentAssigneeId(fetchedIssue.assignedTo);
            setSelectedAssignee(fetchedIssue.assignedTo);
          }
          
          // Fetch comments
          if (fetchedIssue.comments && fetchedIssue.comments.length > 0) {
            // Extract unique commenter IDs for name mapping
            const commenterIds = Array.from(
              new Set(fetchedIssue.comments.map(c => c.employeeUuid))
            );
            
            // Get names for each commenter
            const names: Record<string, string> = {};
            for (const id of commenterIds) {
              try {
                const employee = await getEmployeeById(id);
                if (employee) {
                  names[id] = employee.name;
                } else {
                  names[id] = "Unknown User";
                }
              } catch (error) {
                console.error(`Error fetching employee ${id}:`, error);
                names[id] = "Unknown User";
              }
            }
            
            setCommenterNames(names);
          }
        }
      } catch (error) {
        console.error("Error fetching issue details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueDetails();
  }, [issueId]);

  // Fetch ticket creator details
  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      if (issue?.employeeUuid) {
        try {
          const fetchedEmployee = await getEmployeeById(issue.employeeUuid);
          setEmployee(fetchedEmployee);
        } catch (error) {
          console.error("Error fetching employee details:", error);
        }
      }
    };

    fetchEmployeeDetails();
  }, [issue?.employeeUuid]);

  // Fetch available assignees (admin users who can handle tickets)
  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const users = await getDashboardUsers();
        // Filter users with appropriate permissions if needed
        setAvailableAssignees(users);
        
        // Find name of current assignee if it exists
        if (issue?.assignedTo) {
          const assignee = users.find(u => u.id === issue.assignedTo);
          if (assignee) {
            setCurrentAssigneeName(assignee.name);
          }
        }
      } catch (error) {
        console.error("Error fetching assignees:", error);
      }
    };

    fetchAssignees();
  }, [issue?.assignedTo]);

  // Handle status change
  const handleStatusChange = async (newStatus: Issue["status"]) => {
    if (!issue || !currentUserId) return;
    
    setIsUpdatingStatus(true);
    try {
      const updatedIssue = await updateIssueStatus(issue.id, newStatus, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(updatedIssue.status);
        
        // Show success message
        toast({
          title: "Status updated",
          description: `Ticket status changed to ${newStatus.replace('_', ' ')}`
        });
      } else {
        toast({
          title: "Update failed",
          description: "Failed to update ticket status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update error",
        description: "An error occurred while updating status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle assign ticket to user
  const handleAssignIssue = async () => {
    if (!issue || !currentUserId || !selectedAssignee) return;
    
    setIsAssigning(true);
    try {
      // Updated to use all required parameters
      const success = await assignIssueToUser(issue.id, selectedAssignee, currentUserId);
      if (success) {
        // Update local state with the new assignee
        setIssue(prevIssue => 
          prevIssue ? { ...prevIssue, assignedTo: selectedAssignee } : null
        );
        
        setCurrentAssigneeId(selectedAssignee);
        
        // Find the name of the selected assignee
        const assignee = availableAssignees.find(a => a.id === selectedAssignee);
        if (assignee) {
          setCurrentAssigneeName(assignee.name);
        }
        
        // Show success message
        toast({
          title: "Ticket assigned",
          description: `Ticket assigned to ${assignee?.name || 'selected user'}`
        });
      } else {
        toast({
          title: "Assignment failed",
          description: "Failed to assign the ticket",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error assigning ticket:", error);
      toast({
        title: "Assignment error",
        description: "An error occurred while assigning the ticket",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle add comment - Fix the comment parameter type
  const handleAddComment = async () => {
    if (!issue || !currentUserId || !newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const commentId = await addComment({
        issueId: issue.id,
        employeeUuid: currentUserId,
        content: newComment.trim()
      });
      
      if (commentId) {
        // Get user name for the current user
        let commenterName = commenterNames[currentUserId] || "You";
        if (!commenterNames[currentUserId] && authState.user?.name) {
          commenterName = authState.user.name;
          
          // Update the commenter names map
          setCommenterNames(prev => ({
            ...prev,
            [currentUserId]: authState.user?.name || "You"
          }));
        }
        
        // Create a new comment object
        const newCommentObj: IssueComment = {
          id: commentId,
          employeeUuid: currentUserId,
          content: newComment.trim(),
          createdAt: new Date().toISOString()
        };
        
        // Update the issue with the new comment
        setIssue(prevIssue => {
          if (!prevIssue) return null;
          
          return {
            ...prevIssue,
            comments: [...prevIssue.comments, newCommentObj]
          };
        });
        
        // Clear the comment input
        setNewComment("");
        
        // Show success message
        toast({
          title: "Comment added",
          description: "Your comment has been added to the ticket"
        });
      } else {
        toast({
          title: "Comment failed",
          description: "Failed to add your comment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Comment error",
        description: "An error occurred while adding your comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle reopen ticket
  const handleReopenTicket = async () => {
    if (!issue || !currentUserId) return;
    
    setIsReopeningTicket(true);
    try {
      const updatedIssue = await reopenTicket(issue.id, currentUserId);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(updatedIssue.status);
        setCanReopen(false);
        
        // Show success message
        toast({
          title: "Ticket reopened",
          description: "The ticket has been successfully reopened"
        });
      } else {
        toast({
          title: "Reopen failed",
          description: "Failed to reopen the ticket",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error reopening ticket:", error);
      toast({
        title: "Reopen error",
        description: "An error occurred while reopening the ticket",
        variant: "destructive",
      });
    } finally {
      setIsReopeningTicket(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Handle issue update after mapping
  const handleIssueMapped = (updatedIssue: Issue) => {
    setIssue(updatedIssue);
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
    canReopen,
    isReopeningTicket,
    handleAssignIssue,
    handleStatusChange,
    handleAddComment,
    handleReopenTicket,
    formatDate,
    currentUserId,
    handleIssueMapped,
  };
};
