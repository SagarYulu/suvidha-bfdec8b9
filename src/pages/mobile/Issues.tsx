
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { getIssuesByUserId, getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import { Issue } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Clock, File, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const MobileIssues = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      if (authState.user?.id) {
        try {
          const userIssues = await getIssuesByUserId(authState.user.id);
          setIssues(userIssues);
          setFilteredIssues(userIssues);
        } catch (error) {
          console.error("Error fetching issues:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchIssues();
  }, [authState.user?.id]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = issues.filter((issue) => {
        const typeLabel = getIssueTypeLabel(issue.typeId).toLowerCase();
        const subTypeLabel = getIssueSubTypeLabel(issue.typeId, issue.subTypeId).toLowerCase();
        const description = issue.description.toLowerCase();
        const term = searchTerm.toLowerCase();

        return (
          typeLabel.includes(term) || 
          subTypeLabel.includes(term) || 
          description.includes(term)
        );
      });
      
      setFilteredIssues(filtered);
    } else {
      setFilteredIssues(issues);
    }
  }, [searchTerm, issues]);

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
    });
  };

  return (
    <MobileLayout title="My Issues">
      <div className="space-y-4 pb-16">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yulu-blue"></div>
          </div>
        ) : filteredIssues.length > 0 ? (
          <div className="space-y-3">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                className="bg-white rounded-lg shadow-md p-4 active:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    {getIssueTypeLabel(issue.typeId)}
                  </h3>
                  <Badge className={getStatusBadgeColor(issue.status)}>
                    {issue.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                </p>
                <p className="text-sm mb-3 line-clamp-2">{issue.description}</p>
                <div className="flex justify-between text-xs text-gray-500">
                  <span className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDate(issue.createdAt)}
                  </span>
                  <span className="flex items-center">
                    <File className="h-3 w-3 mr-1" />
                    {issue.comments.length} comments
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <File className="h-12 w-12 mx-auto text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No issues found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No issues match your search" : "You haven't raised any issues yet"}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/mobile/issues/new")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yulu-blue hover:bg-blue-700 focus:outline-none"
              >
                Create a new issue
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
