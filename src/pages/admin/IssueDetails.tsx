
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import {
  getIssueById,
  getIssueTypeLabel,
  getIssueSubTypeLabel,
  updateIssueStatus,
  addComment,
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
import { ArrowLeft, Clock, Mail, MessageSquare, Phone, User as UserIcon } from "lucide-react";

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
        
        // Fetch employee
        try {
          const employeeData = await getUserById(issueData.userId);
          setEmployee(employeeData || null);
        } catch (error) {
          console.error("Error fetching employee:", error);
        }
        
        // Fetch commenter names
        const uniqueUserIds = new Set<string>();
        issueData.comments.forEach(comment => uniqueUserIds.add(comment.userId));
        
        const namesPromises = Array.from(uniqueUserIds).map(async (userId) => {
          try {
            const user = await getUserById(userId);
            return user ? { userId, name: user.name } : null;
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
            return null;
          }
        });
        
        const results = await Promise.all(namesPromises);
        const names: Record<string, string> = {};
        results.forEach(result => {
          if (result) {
            names[result.userId] = result.name;
          }
        });
        
        setCommenterNames(names);
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
    setIsUpdatingStatus(true);
    try {
      const updatedIssue = await updateIssueStatus(id!, newStatus);
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
      const updatedIssue = await addComment(id!, {
        userId: "1", // Admin user ID
        content: newComment.trim(),
      });
      
      if (updatedIssue) {
        setIssue(updatedIssue);
        setNewComment("");
        toast({
          title: "Success",
          description: "Comment added successfully",
        });
        
        // Update commenter names if needed
        if (!commenterNames["1"]) {
          setCommenterNames(prev => ({
            ...prev,
            "1": "Admin",
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
                <div className="space-y-4">
                  {issue.comments.length > 0 ? (
                    issue.comments.map((comment) => (
                      <div key={comment.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-yulu-blue text-white flex items-center justify-center">
                              {commenterNames[comment.userId]?.[0] || "?"}
                            </div>
                            <span className="ml-2 font-medium">
                              {commenterNames[comment.userId] || "Unknown user"}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p>{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No comments yet</p>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <form onSubmit={handleAddComment} className="w-full">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="mb-3"
                    rows={3}
                  />
                  <Button 
                    type="submit" 
                    className="ml-auto bg-yulu-blue hover:bg-blue-700"
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? "Adding..." : "Add Comment"}
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
