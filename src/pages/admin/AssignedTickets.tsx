
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useAuth } from "@/contexts/AuthContext";
import { getAssignedIssuesByUserId, getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { Issue } from "@/types";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Clock, Search } from "lucide-react";

const AssignedTickets = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchAssignedIssues = async () => {
      if (!authState.user?.id) return;
      
      setIsLoading(true);
      try {
        const assignedIssues = await getAssignedIssuesByUserId(authState.user.id);
        setIssues(assignedIssues);
      } catch (error) {
        console.error("Error fetching assigned tickets:", error);
        toast({
          title: "Error",
          description: "Failed to load your assigned tickets",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAssignedIssues();
  }, [authState.user?.id]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
  
  return (
    <AdminLayout title="My Assigned Tickets">
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
          </div>
        ) : issues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {issues.map((issue) => (
              <Card key={issue.id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">
                      {getIssueTypeLabel(issue.typeId)}
                    </CardTitle>
                    <Badge className={getStatusBadgeColor(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <CardDescription>
                    {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="line-clamp-2 text-sm">
                      {issue.description}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(issue.createdAt)}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/admin/issues/${issue.id}`)}
                      >
                        <Search className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No assigned tickets found</h3>
            <p className="mt-2 text-gray-500">
              You don't have any tickets assigned to you at the moment.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AssignedTickets;
