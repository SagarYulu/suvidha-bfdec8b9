
import { useState, useEffect } from "react";
import { InternalComment, getInternalComments, addInternalComment } from "../../services/issues/internalCommentService";
import { getEmployeeNameByUuid } from "../../services/issues/issueUtils";
import { toast } from "../use-toast";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";

export const useInternalComments = (issueId: string | undefined, assigneeId: string | null) => {
  const [internalComments, setInternalComments] = useState<InternalComment[]>([]);
  const [newInternalComment, setNewInternalComment] = useState("");
  const [isSubmittingInternalComment, setIsSubmittingInternalComment] = useState(false);
  const [commentersNames, setCommentersNames] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  
  const currentUserId = user?.id || "";
  
  // Check if current user can interact with internal comments
  const canViewInternalComments = user?.role === 'admin' || currentUserId === assigneeId;
  const canAddInternalComments = canViewInternalComments;
  
  // Fetch internal comments
  useEffect(() => {
    const fetchInternalComments = async () => {
      if (!issueId || !canViewInternalComments) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const comments = await getInternalComments(issueId);
        setInternalComments(comments);
        
        // Get commenter names
        const uniqueCommenterIds = Array.from(
          new Set(comments.map(c => c.employeeUuid))
        );
        
        const names: Record<string, string> = {};
        for (const commenterId of uniqueCommenterIds) {
          try {
            // Try to get user info from API
            const response = await api.get(`/users/${commenterId}`);
            if (response.data && response.data.name) {
              names[commenterId] = response.data.name;
              continue;
            }
            
            // Fallback to utility function
            const name = await getEmployeeNameByUuid(commenterId);
            names[commenterId] = name || "Unknown User";
          } catch (err) {
            console.error(`Error fetching name for ${commenterId}:`, err);
            names[commenterId] = "Unknown User";
          }
        }
        
        // Add current user to names list
        if (currentUserId && !names[currentUserId]) {
          const currentUserName = user?.name || "Current User";
          names[currentUserId] = currentUserName;
        }
        
        console.log("Fetched commenter names:", names);
        setCommentersNames(names);
      } catch (error) {
        console.error("Error fetching internal comments:", error);
        toast({
          title: "Error",
          description: "Failed to load internal comments",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInternalComments();
  }, [issueId, canViewInternalComments, currentUserId, user]);
  
  // Add internal comment
  const handleAddInternalComment = async () => {
    if (!issueId || !newInternalComment.trim() || !currentUserId || !canAddInternalComments) {
      return;
    }
    
    setIsSubmittingInternalComment(true);
    try {
      console.log(`Adding internal comment as user: ${user?.name || currentUserId}`);
      
      const addedComment = await addInternalComment(
        issueId,
        currentUserId,
        newInternalComment
      );
      
      if (addedComment) {
        setInternalComments(prev => [...prev, addedComment]);
        setNewInternalComment("");
        toast({
          title: "Success",
          description: "Internal comment added",
        });
      }
    } catch (error) {
      console.error("Error adding internal comment:", error);
      toast({
        title: "Error",
        description: "Failed to add internal comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingInternalComment(false);
    }
  };
  
  return {
    internalComments,
    newInternalComment,
    setNewInternalComment,
    isSubmittingInternalComment,
    commentersNames,
    isLoading,
    handleAddInternalComment,
    canViewInternalComments,
    canAddInternalComments,
  };
};
