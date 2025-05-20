
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue, IssueComment } from "@/types";
import { getIssueById, addComment } from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { toast } from "@/hooks/use-toast";
import { formatDate, getStatusBadgeColor } from "@/utils/formatUtils";
import { isTicketReopenable } from "@/utils/workingTimeUtils";
import { useIssueReopenMobile } from "@/hooks/issues/useIssueReopenMobile";

export function useMobileIssue(issueId: string | undefined) {
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  
  const currentUserId = authState.user?.id || "";
  
  // Add reopen ticket functionality
  const {
    isReopeningTicket,
    processReopenTicket
  } = useIssueReopenMobile(issueId, currentUserId, setIssue);
  
  // Check if ticket is reopenable
  const isReopenable = issue && 
    (issue.status === 'closed' || issue.status === 'resolved') && 
    issue.closedAt && 
    isTicketReopenable(issue.closedAt);

  // Filter out private messages for mobile view
  const filterPrivateMessages = (comments: IssueComment[]): IssueComment[] => {
    if (!issue) return [];
    
    // In mobile view, only show comments that are public or from the current user
    return comments.filter(comment => {
      // Allow employee's own comments
      if (comment.employeeUuid === currentUserId) {
        return true;
      }
      
      // For all other comments, check if private
      // For now assume all comments between assignee and creator are private in admin view
      const isPrivateMessage = 
        (comment.employeeUuid === issue.assignedTo && issue.employeeUuid !== currentUserId) || 
        (comment.employeeUuid === issue.employeeUuid && issue.assignedTo !== currentUserId);
      
      return !isPrivateMessage;
    });
  };

  useEffect(() => {
    const fetchIssue = async () => {
      if (!issueId) return;
      
      setIsLoading(true);
      try {
        const issueData = await getIssueById(issueId);
        if (!issueData) {
          setErrorMessage("Issue not found");
          return;
        }
        
        if (issueData.employeeUuid !== authState.user?.id) {
          setErrorMessage("You do not have permission to view this issue");
          return;
        }
        
        // Apply privacy filtering for comments
        const filteredComments = filterPrivateMessages(issueData.comments);
        const filteredIssue = {
          ...issueData,
          comments: filteredComments
        };
        
        setIssue(filteredIssue);
        console.log("Fetched issue data:", filteredIssue);
        
        // Fetch commenter names
        const uniqueUserIds = new Set<string>();
        filteredComments.forEach(comment => uniqueUserIds.add(comment.employeeUuid));
        
        const namesPromises = Array.from(uniqueUserIds).map(async (employeeUuid) => {
          try {
            const user = await getUserById(employeeUuid);
            return user ? { employeeUuid, name: user.name } : null;
          } catch (error) {
            console.error(`Error fetching user ${employeeUuid}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(namesPromises);
        const names: Record<string, string> = {};
        results.forEach(result => {
          if (result) {
            names[result.employeeUuid] = result.name;
          }
        });
        
        setCommenterNames(names);
      } catch (error) {
        console.error("Error fetching issue:", error);
        setErrorMessage("An error occurred while fetching the issue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssue();
  }, [issueId, authState.user?.id]);

  useEffect(() => {
    // Poll for updates every 30 seconds to get new comments
    const intervalId = setInterval(async () => {
      if (issueId && issue) {
        try {
          const refreshedIssue = await getIssueById(issueId);
          
          if (refreshedIssue) {
            // Apply privacy filtering for comments
            const filteredComments = filterPrivateMessages(refreshedIssue.comments);
            const filteredIssue = {
              ...refreshedIssue,
              comments: filteredComments
            };
            
            if (filteredComments.length !== issue?.comments.length) {
              console.log("Refreshed issue with updated comments:", filteredIssue);
              setIssue(filteredIssue);
            
              // Update commenter names for any new comments
              const uniqueUserIds = new Set<string>();
              filteredComments.forEach(comment => {
                if (!commenterNames[comment.employeeUuid]) {
                  uniqueUserIds.add(comment.employeeUuid);
                }
              });
              
              if (uniqueUserIds.size > 0) {
                const namesPromises = Array.from(uniqueUserIds).map(async (employeeUuid) => {
                  try {
                    const user = await getUserById(employeeUuid);
                    return user ? { employeeUuid, name: user.name } : null;
                  } catch (error) {
                    return null;
                  }
                });
                
                const results = await Promise.all(namesPromises);
                setCommenterNames(prev => {
                  const updated = { ...prev };
                  results.forEach(result => {
                    if (result) {
                      updated[result.employeeUuid] = result.name;
                    }
                  });
                  return updated;
                });
              }
            }
          }
        } catch (error) {
          console.error("Error polling for updates:", error);
        }
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [issueId, issue, commenterNames]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user?.id || !issueId) {
      toast({
        title: "Error",
        description: "You must be logged in to comment",
        variant: "destructive",
      });
      return;
    }
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Adding comment as user:", authState.user.id);
      
      const comment = await addComment(issueId, {
        employeeUuid: authState.user.id,
        content: newComment.trim(),
      });
      
      if (comment) {
        // Fetch the updated issue to get all comments
        const updatedIssue = await getIssueById(issueId);
        if (updatedIssue) {
          // Apply privacy filtering for comments
          const filteredComments = filterPrivateMessages(updatedIssue.comments);
          const filteredIssue = {
            ...updatedIssue,
            comments: filteredComments
          };
          
          console.log("Updated issue after adding comment:", filteredIssue);
          setIssue(filteredIssue);
          setNewComment("");
          toast({
            title: "Success",
            description: "Comment added successfully",
          });
          
          // Update commenter names
          if (authState.user && !commenterNames[authState.user.id]) {
            setCommenterNames(prev => ({
              ...prev,
              [authState.user!.id]: authState.user!.name,
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    issue,
    isLoading,
    errorMessage,
    newComment,
    setNewComment,
    isSubmitting,
    commenterNames,
    handleSubmitComment,
    getStatusBadgeColor,
    formatDate,
    currentUserId,
    isReopenable,
    processReopenTicket
  };
}
