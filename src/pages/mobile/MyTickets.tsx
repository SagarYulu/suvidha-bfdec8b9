
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MobileLayout from "@/components/MobileLayout";
import { getIssuesByUserId } from "@/services/issues/issueCore";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import { Issue } from "@/types";
import { Button } from "@/components/ui/button";
import { Clock, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/utils/formatUtils";
import IssueLoading from "@/components/mobile/issues/IssueLoading";
import IssueError from "@/components/mobile/issues/IssueError";
import TicketFeedbackButton from "@/components/mobile/issues/TicketFeedbackButton";

const MyTickets = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssues = async () => {
      setIsLoading(true);
      if (authState.user?.id) {
        try {
          const userIssues = await getIssuesByUserId(authState.user.id);
          setIssues(userIssues);
          setFilteredIssues(userIssues);
        } catch (error) {
          console.error("Error fetching tickets:", error);
          setLoadError("Error loading your tickets. Please try again.");
        } finally {
          setIsLoading(false);
        }
      } else {
        // If no user ID is available, still stop loading
        setIsLoading(false);
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

  const handleRetry = () => {
    setLoadError(null);
    setIsLoading(true);
    
    if (authState.user?.id) {
      // Force refetch issues
      getIssuesByUserId(authState.user.id)
        .then(userIssues => {
          setIssues(userIssues);
          setFilteredIssues(userIssues);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error retrying ticket fetch:", error);
          setLoadError("Could not load your tickets. Please try again.");
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <IssueLoading title="My Tickets" message="Loading your tickets..." />;
  }

  if (loadError) {
    return (
      <IssueError 
        title="My Tickets" 
        errorMessage={loadError}
      />
    );
  }

  return (
    <MobileLayout title="My Tickets / मेरे टिकट">
      <div className="space-y-4 pb-16">
        {/* Search Bar */}
        <div className="relative mb-4 bg-white rounded-lg">
          <div className="flex items-center px-3">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search tickets... / टिकट खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 rounded-lg"
            />
          </div>
        </div>

        {/* Tickets List */}
        {filteredIssues.length > 0 ? (
          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const isClosedTicket = issue.status === "closed" || issue.status === "resolved";
              
              return (
                <div
                  key={issue.id}
                  className="bg-white rounded-lg p-4 active:bg-gray-50"
                >
                  <div 
                    onClick={() => navigate(`/mobile/issues/${issue.id}`)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">
                        {getIssueTypeLabel(issue.typeId)}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        issue.status === "open" ? "bg-red-500 text-white" : 
                        issue.status === "in_progress" ? "bg-yellow-500 text-white" : 
                        "bg-green-500 text-white"
                      }`}>
                        {issue.status === "open" ? "Open / खुला" : 
                        issue.status === "in_progress" ? "In progress / प्रगति पर" : 
                        "Closed / बंद"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {getIssueSubTypeLabel(issue.typeId, issue.subTypeId)}
                    </p>
                    <p className="text-sm mb-3 line-clamp-2">{issue.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatShortDate(issue.createdAt)}
                      </span>
                      <span className="flex items-center">
                        {issue.comments ? issue.comments.length : 0} comments / टिप्पणियाँ
                      </span>
                    </div>
                  </div>
                  
                  {/* Show feedback button only for closed tickets */}
                  {isClosedTicket && authState.user?.id && (
                    <TicketFeedbackButton
                      ticketId={issue.id}
                      resolverUuid={issue.assignedTo}
                      employeeUuid={authState.user.id}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg p-4">
            <h3 className="mt-2 text-lg font-medium">No tickets found / कोई टिकट नहीं मिला</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No tickets match your search / आपकी खोज से मेल खाने वाला कोई टिकट नहीं" : "You haven't raised any tickets yet / आपने अभी तक कोई टिकट नहीं बनाया है"}
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/mobile/issues/new")}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-yulu-dashboard-blue hover:bg-yulu-dashboard-blue-dark"
              >
                Raise a new ticket / नया टिकट बनाएँ
              </button>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default MyTickets;
