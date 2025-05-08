
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext"; 
import {
  getIssueById,
  getIssueTypeLabel,
  getIssueSubTypeLabel,
  updateIssueStatus,
  addComment,
  getManagersList,
  assignIssueToUser,
  getEmployeeNameByUuid
} from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { Issue, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Mail, MessageSquare, Phone, Send, User as UserIcon } from "lucide-react";

const AdminIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [status, setStatus] = useState<Issue["status"]>("open");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const { authState } = useAuth();
  
  // New state for assignment
  const [assigneeOptions, setAssigneeOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<string>("");
  const [assigneeName, setAssigneeName] = useState<string>("Unassigned");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchIssueAndEmployee = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const issueData = await getIssueById(id);
        if (!issueData) {
          toast({
            title: "Error",
            description: "Issue not found",
            variant: "destructive",
          });
          navigate("/admin/issues");
          return;
        }
        
        setIssue(issueData);
        setStatus(issueData.status);
        
        // Set selected assignee if it exists
        if (issueData.assignedTo) {
          setSelectedAssigneeId(issueData.assignedTo);
          
          // Fetch assignee name
          try {
            const name = await getEmployeeNameByUuid(issueData.assignedTo);
            setAssigneeName(name);
          } catch (error) {
            console.error("Error fetching assignee name:", error);
          }
        }
        
        // Fetch employee
        try {
          const employeeData = await getUserById(issueData.employeeUuid);
          setEmployee(employeeData || null);
        } catch (error) {
          console.error("Error fetching employee:", error);
        }
        
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
        
        // Fetch potential assignees
        const managers = await getManagersList();
        setAssigneeOptions(managers);
        
      } catch (error) {
        console.error("Error fetching issue details:", error);
        toast({
          title: "Error",
          description: "Failed to load issue details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchIssueAndEmployee();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: Issue["status"]) => {
    if (status === newStatus) return; // Don't update if status hasn't changed
    
    setIsUpdatingStatus(true);
    try {
      // Get the current admin user UUID from authState
      const adminUuid = authState.user?.id;
      
      if (!adminUuid) {
        console.warn("Admin UUID not available for status change");
      } else {
        console.log("Status change initiated by admin UUID:", adminUuid);
      }
      
      const updatedIssue = await updateIssueStatus(id!, newStatus, adminUuid);
      if (updatedIssue) {
        setIssue(updatedIssue);
        setStatus(newStatus);
        toast({
          title: "Success",
          description: "Issue status updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating issue status:", error);
      toast({
        title: "Error",
        description: "Failed to update issue status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // New handler for issue assignment
  const handleAssigneeChange = async (assigneeId: string) => {
    if (!id || (issue?.assignedTo === assigneeId)) return;
    
    setIsAssigning(true);
    setSelectedAssigneeId(assigneeId);
    
    try {
      // Get the current admin user UUID from authState
      const adminUuid = authState.user?.id;
      
      const updatedIssue = await assignIssueToUser(id, assigneeId, adminUuid);
      if (updatedIssue) {
        setIssue(updatedIssue);
        
        // Get assignee name from options
        const assignee = assigneeOptions.find(option => option.id === assigneeId);
        if (assignee) {
          setAssigneeName(assignee.name);
        } else {
          // If not found in options, fetch directly
          const name = await getEmployeeNameByUuid(assigneeId);
          setAssigneeName(name);
        }
        
        toast({
          title: "Success",
          description: "Issue assigned successfully",
        });
      }
    } catch (error) {
      console.error("Error assigning issue:", error);
      toast({
        title: "Error",
        description: "Failed to assign issue",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      // Get the current admin user UUID from authState
      const adminUuid = authState.user?.id;
      
      if (!adminUuid) {
        console.warn("Admin UUID not available for comment");
      } else {
        console.log("Comment being added by admin UUID:", adminUuid);
      }
      
      const comment = await addComment(id!, {
        employeeUuid: adminUuid || "",
        content: newComment.trim(),
      });
      
      if (comment) {
        // Fetch the updated issue to get all comments
        const updatedIssue = await getIssueById(id!);
        if (updatedIssue) {
          setIssue(updatedIssue);
          setNewComment("");
          toast({
            title: "Success",
            description: "Comment added successfully",
          });
          
          // Update commenter names if needed
          if (adminUuid && !commenterNames[adminUuid]) {
            setCommenterNames(prev => ({
              ...prev,
              [adminUuid]: authState.user?.name || "Admin",
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
      setIsSubmittingComment(false);
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

  const getStatusBadgeColor = (statusValue: Issue["status"]) => {
    switch (statusValue) {
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

  if (isLoading) {
    return (
      <AdminLayout title="Issue Details">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!issue) {
    return (
      <AdminLayout title="Issue Details">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">Issue not found</h3>
          <Button variant="link" onClick={() => navigate("/admin/issues")}>
            Back to Issues
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Issue Details">
      <div className="space-y-6">
        <div className="flex items-center mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/admin/issues")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Issues
          </Button>
          
          <Badge className={getStatusBadgeColor(issue.status)}>
            {issue.status.replace("_", " ")}
          </Badge>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{getIssueTypeLabel(issue.typeId)}</CardTitle>
                    <CardDescription>{getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}</CardDescription>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Created: {formatDate(issue.createdAt)}
                    </div>
                    {issue.closedAt && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        Closed: {formatDate(issue.closedAt)}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold mb-2">Description:</h3>
                <p className="text-gray-700">{issue.description}</p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex justify-between w-full">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Priority:</span>
                    <Badge variant="outline" className="capitalize">
                      {issue.priority}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium mr-2">Status:</span>
                    <Select
                      value={status}
                      onValueChange={handleStatusChange}
                      disabled={isUpdatingStatus}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments ({issue.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4 max-h-[400px] overflow-y-auto p-2">
                  {issue.comments.length > 0 ? (
                    issue.comments.map((comment) => {
                      // Check if this is the current admin user's comment
                      const isAdmin = comment.employeeUuid === authState.user?.id || 
                                      comment.employeeUuid === "1" || 
                                      comment.employeeUuid === "admin-fallback";
                      
                      const userName = commenterNames[comment.employeeUuid] || "Unknown user";
                      const userInitial = userName.charAt(0).toUpperCase();
                      
                      return (
                        <div 
                          key={comment.id} 
                          className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`flex max-w-[75%] ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}
                          >
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 ${
                                isAdmin ? 'ml-2 bg-blue-600' : 'mr-2 bg-yulu-blue'
                              }`}
                            >
                              {isAdmin ? 'A' : userInitial}
                            </div>
                            
                            <div 
                              className={`rounded-lg px-4 py-2 ${
                                isAdmin 
                                  ? 'bg-blue-100 text-blue-900' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="text-xs font-semibold mb-1">
                                {userName}
                              </div>
                              <div className="text-sm">{comment.content}</div>
                              <div className="text-xs text-gray-500 mt-1 text-right">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No comments yet
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <form onSubmit={handleAddComment} className="w-full flex items-center">
                  <div className="flex-grow mr-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[60px]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="bg-yulu-blue hover:bg-blue-700 h-[60px] px-4"
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Employee Information</CardTitle>
              </CardHeader>
              <CardContent>
                {employee ? (
                  <div className="space-y-3">
                    <div className="flex justify-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-yulu-blue text-white flex items-center justify-center text-2xl">
                        {employee.name.charAt(0)}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{employee.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{employee.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{employee.phone}</span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Employee ID</p>
                        <p className="font-medium">{employee.employeeId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">City</p>
                        <p className="font-medium">{employee.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Cluster</p>
                        <p className="font-medium">{employee.cluster}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Manager</p>
                        <p className="font-medium">{employee.manager || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Employee information not available</p>
                )}
              </CardContent>
            </Card>
            
            {/* New card for issue assignment */}
            <Card>
              <CardHeader>
                <CardTitle>Issue Assignment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Currently Assigned To:</p>
                    <p className="font-medium">{assigneeName}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">Assign Issue To:</p>
                    <Select
                      value={selectedAssigneeId}
                      onValueChange={handleAssigneeChange}
                      disabled={isAssigning}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Unassigned</SelectItem>
                        {assigneeOptions.map(option => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {isAssigning && (
                      <div className="flex justify-center mt-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yulu-blue"></div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Issue Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(issue.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">{formatDate(issue.updatedAt)}</p>
                  </div>
                  {issue.closedAt && (
                    <div>
                      <p className="text-sm text-gray-500">Closed</p>
                      <p className="font-medium">{formatDate(issue.closedAt)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIssueDetails;
