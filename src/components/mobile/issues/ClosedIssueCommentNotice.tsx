
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MessageSquare, RefreshCw } from "lucide-react";
import TicketFeedbackButton from "./TicketFeedbackButton";

interface ClosedIssueCommentNoticeProps {
  isReopenable: boolean;
  onReopen: (reason: string) => void;
  ticketId: string;
  resolverUuid?: string | null;
  employeeUuid?: string;
}

const ClosedIssueCommentNotice: React.FC<ClosedIssueCommentNoticeProps> = ({
  isReopenable,
  onReopen,
  ticketId,
  resolverUuid,
  employeeUuid = "" // Default to empty string if not provided
}) => {
  const [reopenReason, setReopenReason] = useState("");
  const [showReopenForm, setShowReopenForm] = useState(false);
  
  const handleReopenClick = () => {
    setShowReopenForm(true);
  };
  
  const handleSubmitReopen = () => {
    if (reopenReason.trim()) {
      onReopen(reopenReason);
      setShowReopenForm(false);
      setReopenReason("");
    }
  };
  
  const handleCancelReopen = () => {
    setShowReopenForm(false);
    setReopenReason("");
  };
  
  return (
    <div className="p-4 border-b mb-4">
      <div className="mb-4 bg-gray-50 p-4 rounded-md">
        <p className="text-gray-600 text-sm mb-2">
          This ticket has been {resolverUuid ? "resolved" : "closed"}.
        </p>
        
        {!showReopenForm && isReopenable && (
          <Button
            variant="outline"
            className="w-full mt-2 border-dashed border-orange-500 text-orange-600 hover:bg-orange-50"
            onClick={handleReopenClick}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reopen This Ticket / इस टिकट को फिर से खोलें
          </Button>
        )}
        
        {showReopenForm && (
          <div className="mt-3">
            <Textarea
              placeholder="Please provide a reason for reopening this ticket / कृपया इस टिकट को फिर से खोलने का कारण प्रदान करें"
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              className="mb-2 w-full"
            />
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handleCancelReopen}
              >
                Cancel / रद्द करें
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600" 
                onClick={handleSubmitReopen}
                disabled={!reopenReason.trim()}
              >
                Submit / जमा करें
              </Button>
            </div>
          </div>
        )}
        
        {resolverUuid && !showReopenForm && (
          <TicketFeedbackButton 
            ticketId={ticketId} 
            resolverUuid={resolverUuid}
            employeeUuid={employeeUuid} 
          />
        )}
      </div>
    </div>
  );
};

export default ClosedIssueCommentNotice;
