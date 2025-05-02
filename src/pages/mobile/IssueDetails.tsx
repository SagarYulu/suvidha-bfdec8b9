import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import {
  getIssueById,
  getIssueTypeLabel,
  getIssueSubTypeLabel,
  addComment,
} from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { Issue, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Clock, MessageSquare, Send, User as UserIcon } from "lucide-react";

const MobileIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { authState } = useAuth();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchIssue = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const issueData = await getIssueById(id);
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
        console.log("Comments count:", issueData.comments?.length || 0);
        
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
  }, [id, authState.user?.id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user?.id || !id) {
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
      
      const updatedIssue = await addComment(id, {
        employeeUuid: authState.user.id,
        content: newComment.trim(),
      });
      
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

  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-500";
      case "in_progress":
        return "bg-yellow-500";
      case "resolved":
        return "bg-green-500";
      case "closed":
        return "bg-green-700";
      default:
        return "bg-gray-500";
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

  useEffect(() => {
    // Poll for updates every 30 seconds to get new comments
    const intervalId = setInterval(async () => {
      if (id) {
        try {
          const refreshedIssue = await getIssueById(id);
          
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
  }, [id, issue, commenterNames]);

  if (isLoading) {
    return (
      <MobileLayout title="Issue Details">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
        </div>
      </MobileLayout>
    );
  }

  if (errorMessage || !issue) {
    return (
      <MobileLayout title="Issue Details">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">{errorMessage || "Issue not found"}</h3>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout title="Issue Details">
      <div className="pb-16">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <h2 className="font-semibold text-lg">
              {getIssueTypeLabel(issue.typeId)}
            </h2>
            <Badge className={getStatusBadgeColor(issue.status)}>
              {issue.status.replace("_", " ")}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
          </p>
          
          <div className="text-sm mb-4">
            <p className="flex items-center text-gray-500 mb-1">
              <Clock className="h-3 w-3 mr-1" />
              Created on {formatDate(issue.createdAt)}
            </p>
          </div>
          
          <div className="border-t border-gray-200 pt-3">
            <h3 className="font-medium mb-2">Description:</h3>
            <p className="text-gray-700">{issue.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h3 className="font-semibold flex items-center mb-3">
            <MessageSquare className="h-4 w-4 mr-1" />
            Conversation ({issue.comments.length})
          </h3>
          
          <div className="space-y-3 max-h-[350px] overflow-y-auto mb-4 p-1">
            {issue.comments.length > 0 ? (
              issue.comments.map((comment) => {
                const isCurrentUser = comment.employeeUuid === authState.user?.id;
                const isAdmin = comment.employeeUuid === "1";
                const userName = commenterNames[comment.employeeUuid] || (isAdmin ? "Admin" : "Unknown");
                
                return (
                  <div 
                    key={comment.id} 
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`flex max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div 
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                          isCurrentUser 
                            ? 'ml-2 bg-yulu-blue' 
                            : isAdmin 
                              ? 'mr-2 bg-blue-600' 
                              : 'mr-2 bg-gray-500'
                        }`}
                      >
                        {userName[0] || "?"}
                      </div>
                      
                      <div 
                        className={`rounded-lg px-3 py-2 ${
                          isCurrentUser 
                            ? 'bg-yulu-blue text-white rounded-tr-none' 
                            : isAdmin
                              ? 'bg-blue-100 text-blue-900 rounded-tl-none'
                              : 'bg-gray-200 text-gray-900 rounded-tl-none'
                        }`}
                      >
                        <div className="text-xs font-medium mb-1">
                          {isCurrentUser ? 'You' : userName}
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {formatDate(comment.createdAt).split(',')[1]}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                No messages yet. Start the conversation!
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmitComment} className="flex items-end">
            <div className="flex-grow mr-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type your message here..."
                className="min-h-[60px] resize-none"
                rows={2}
              />
            </div>
            <Button 
              type="submit" 
              className="bg-yulu-blue hover:bg-blue-700 h-[60px] aspect-square flex items-center justify-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MobileIssueDetails;
