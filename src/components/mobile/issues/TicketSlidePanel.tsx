
import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Search, Clock, ListFilter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Issue } from "@/types";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/utils/formatUtils";
import { getIssueTypeLabel, getIssueSubTypeLabel } from "@/services/issues/issueTypeHelpers";
import TicketFeedbackButton from "./TicketFeedbackButton";

interface TicketSlidePanelProps {
  issues: Issue[];
  trigger: React.ReactNode;
  currentUserId: string;
  onTicketSelect?: (issueId: string) => void;
}

const TicketSlidePanel: React.FC<TicketSlidePanelProps> = ({ 
  issues, 
  trigger,
  currentUserId,
  onTicketSelect
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const filteredIssues = React.useMemo(() => {
    if (!searchTerm) return issues;
    
    return issues.filter((issue) => {
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
  }, [searchTerm, issues]);

  const handleTicketClick = (issueId: string) => {
    if (onTicketSelect) {
      onTicketSelect(issueId);
    } else {
      navigate(`/mobile/issues/${issueId}`);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[450px] p-0 border-l-0">
        <SheetHeader className="bg-yulu-dashboard-blue p-4 text-white border-b">
          <SheetTitle className="text-white">My Tickets / मेरे टिकट</SheetTitle>
        </SheetHeader>
        
        <div className="p-4 h-[calc(100vh-56px)] overflow-y-auto">
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
                      onClick={() => handleTicketClick(issue.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">
                          {getIssueTypeLabel(issue.typeId)}
                        </h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${issue.status === "open" ? "bg-red-500 text-white" : 
                                        issue.status === "in_progress" ? "bg-yellow-500 text-white" : 
                                        "bg-green-500 text-white"}`}>
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
                    {isClosedTicket && (
                      <TicketFeedbackButton
                        ticketId={issue.id}
                        resolverUuid={issue.assignedTo}
                        employeeUuid={currentUserId}
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
      </SheetContent>
    </Sheet>
  );
};

export default TicketSlidePanel;
