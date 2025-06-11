
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Issue } from "@/types";
import { getIssueById } from "@/services/issues/issueFetchService";
import { addComment } from "@/services/issues/issueCommentService";
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
        
        setIssue(issueData);
        console.log("Fetched issue data:", issueData);
        
        // Fetch commenter names
        const uniqueUserIds = new Set<string>();
        issueData.comments.forEach(comment => uniqueUserIds.add(comment.employeeUuid));
        
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
          
          if (refreshedIssue && refreshedIssue.comments.length !== issue?.comments.length) {
            console.log("Refreshed issue with updated comments:", refreshedIssue);
            setIssue(refreshedIssue);
            
            // Update commenter names for any new comments
            const uniqueUserIds = new Set<string>();
            refreshedIssue.comments.forEach(comment => {
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
      
      // Use addComment with the correct signature: issueId, employeeUuid, content
      const comment = await addComment(issueId, authState.user.id, newComment.trim());
      
      if (comment) {
        // Fetch the updated issue to get all comments
        const updatedIssue = await getIssueById(issueId);
        if (updatedIssue) {
          console.log("Updated issue after adding comment:", updatedIssue);
          setIssue(updatedIssue);
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
