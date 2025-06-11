
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getIssues, getIssueTypeLabel } from "@/services/issueService";
import { Issue } from "@/types";
import { formatDate } from "@/lib/utils";
import { Plus, Eye } from "lucide-react";

const MobileIssues = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate('/mobile/login');
      return;
    }
    fetchIssues();
  }, [authState.isAuthenticated, navigate]);

  const fetchIssues = async () => {
    if (!authState.user?.id) return;
    
    setIsLoading(true);
    try {
      const data = await getIssues({ employeeId: authState.user.id });
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeColor = (status: Issue["status"]) => {
    switch (status) {
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <MobileLayout title="My Issues">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">My Issues ({issues.length})</h2>
          <Button
            onClick={() => navigate('/mobile/issues/new')}
            className="flex items-center gap-2"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            New Issue
          </Button>
        </div>

        {/* Issues List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : issues.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No issues found</p>
              <Button onClick={() => navigate('/mobile/issues/new')}>
                Create Your First Issue
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <Card key={issue.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-sm">
                      {getIssueTypeLabel(issue.typeId)}
                    </h3>
                    <Badge className={getStatusBadgeColor(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {issue.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      {formatDate(issue.createdAt)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
