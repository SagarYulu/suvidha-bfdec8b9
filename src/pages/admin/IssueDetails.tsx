
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext"; 
import {
  getIssueById,
  getIssueTypeLabel,
  getIssueSubTypeLabel,
  updateIssueStatus,
  addComment,
  assignIssueToUser,
} from "@/services/issueService";
import { getUserById } from "@/services/userService";
import { Issue, User, DashboardUser } from "@/types";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Import the new components
import IssueHeader from "@/components/admin/issues/IssueHeader";
import IssueDetailsCard from "@/components/admin/issues/IssueDetailsCard";
import EmployeeInformation from "@/components/admin/issues/EmployeeInformation";
import TicketAssignment from "@/components/admin/issues/TicketAssignment";
import IssueActivity from "@/components/admin/issues/IssueActivity";
import CommentSection from "@/components/admin/issues/CommentSection";
import IssueLoading from "@/components/admin/issues/IssueLoading";
import IssueError from "@/components/admin/issues/IssueError";

const AdminIssueDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [issue, setIssue] = useState<Issue | null>(null);
  const [employee, setEmployee] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [status, setStatus] = useState<Issue["status"]>("open");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [commenterNames, setCommenterNames] = useState<Record<string, string>>({});
  const { authState } = useAuth(); 
  const [dashboardUsers, setDashboardUsers] = useState<DashboardUser[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");

  useEffect(() => {
    const fetchDashboardUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('dashboard_users')
          .select('*');
          
        if (error) {
          console.error("Error fetching dashboard users:", error);
          return;
        }
        
        setDashboardUsers(data || []);
      } catch (error) {
        console.error("Error in fetchDashboardUsers:", error);
      }
    };
    
    fetchDashboardUsers();
  }, []);

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
          return;
        }
        
        setIssue(issueData);
        setStatus(issueData.status);
        if (issueData.assignedTo) {
          setSelectedAssignee(issueData.assignedTo);
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
  }, [id]);

  const handleAssignIssue = async () => {
    if (!selectedAssignee || !id || !authState.user?.id) return;
    
    setIsAssigning(true);
    try {
      const updated = await assignIssueToUser(
        id, 
        selectedAssignee, 
        authState.user.id
      );
      
      if (updated) {
        setIssue(updated);
        toast({
          title: "Success", 
          description: "Ticket assigned successfully"
        });
      }
    } catch (error) {
      console.error("Error assigning issue:", error);
      toast({
        title: "Error",
        description: "Failed to assign ticket",
        variant: "destructive",
      });
    } finally {
      setIsAssigning(false);
    }
  };

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

  if (isLoading) {
    return <IssueLoading />;
  }

  if (!issue) {
    return <IssueError />;
  }

  return (
    <AdminLayout title="Issue Details">
      <div className="space-y-6">
        <IssueHeader issue={issue} />
        
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <IssueDetailsCard
              issue={issue}
              status={status}
              handleStatusChange={handleStatusChange}
              isUpdatingStatus={isUpdatingStatus}
              formatDate={formatDate}
              getIssueTypeLabel={getIssueTypeLabel}
              getIssueSubTypeLabel={getIssueSubTypeLabel}
            />

            <CommentSection
              issue={issue}
              newComment={newComment}
              setNewComment={setNewComment}
              handleAddComment={handleAddComment}
              isSubmittingComment={isSubmittingComment}
              commenterNames={commenterNames}
              formatDate={formatDate}
              currentUser={authState.user?.id}
            />
          </div>
          
          <div className="space-y-6">
            <EmployeeInformation employee={employee} />
            
            <TicketAssignment
              issue={issue}
              dashboardUsers={dashboardUsers}
              isAssigning={isAssigning}
              handleAssignIssue={handleAssignIssue}
              selectedAssignee={selectedAssignee}
              setSelectedAssignee={setSelectedAssignee}
            />
            
            <IssueActivity issue={issue} formatDate={formatDate} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminIssueDetails;
