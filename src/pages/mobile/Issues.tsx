
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MobileLayout from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getIssuesByEmployeeId } from "@/services/issueService";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issueService";
import MobileIssueStatus from "@/components/mobile/issues/MobileIssueStatus";
import { Issue } from "@/types";

const MobileIssues = () => {
  const { authState } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      if (authState.user?.id) {
        setIsLoading(true);
        try {
          const fetchedIssues = await getIssuesByEmployeeId(authState.user.id);
          setIssues(fetchedIssues);
        } catch (error) {
          console.error("Error fetching issues:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchIssues();
  }, [authState.user]);

  return (
    <MobileLayout
      title="My Tickets"
      bgColor="bg-yulu-dashboard-blue"
    >
      <div className="pb-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">All Tickets</h2>
          <Link to="/mobile/new-issue">
            <Button className="bg-yulu-dashboard-blue text-white" size="sm">
              <Plus className="mr-1 h-4 w-4" /> New Ticket
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <div className="loading-spinner"></div>
          </div>
        ) : issues.length === 0 ? (
          <div className="text-center p-6 bg-gray-100 rounded-lg">
            <p className="text-gray-600">No tickets found.</p>
            <Link to="/mobile/new-issue">
              <Button className="mt-4 bg-yulu-dashboard-blue text-white">
                <Plus className="mr-1 h-4 w-4" /> Create Your First Ticket
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <Link key={issue.id} to={`/mobile/issues/${issue.id}`}>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {getIssueTypeLabel(issue.typeId)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                      </p>
                    </div>
                    <MobileIssueStatus 
                      status={issue.status} 
                      updatedAt={issue.updatedAt}
                      closedAt={issue.closedAt}
                      issueId={issue.id}
                      employeeUuid={authState.user?.id}
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {issue.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MobileIssues;
