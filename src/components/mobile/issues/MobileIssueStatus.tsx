
import React, { useState, useEffect } from "react";
import { getStatusBadgeColor } from "@/utils/formatUtils";
import { CheckCircle, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatUtils";
import { checkFeedbackExists } from "@/services/ticketFeedbackService";
import FeedbackDialog from "./FeedbackDialog";
import { isTicketReopenable } from "@/utils/workingTimeUtils";

interface MobileIssueStatusProps {
  status: string;
  updatedAt?: string;
  closedAt?: string;
  issueId?: string;
  employeeUuid?: string;
}

const MobileIssueStatus = ({ 
  status, 
  updatedAt,
  closedAt,
  issueId,
  employeeUuid 
}: MobileIssueStatusProps) => {
  const isClosedOrResolved = status === "closed" || status === "resolved";
  const isReopenable = closedAt && isTicketReopenable(closedAt);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [hasFeedback, setHasFeedback] = useState(false);
  const [checkingFeedback, setCheckingFeedback] = useState(true);
  
  // Check if user has already submitted feedback
  useEffect(() => {
    const checkForExistingFeedback = async () => {
      if (issueId && employeeUuid && isClosedOrResolved) {
        setCheckingFeedback(true);
        const exists = await checkFeedbackExists(issueId, employeeUuid);
        setHasFeedback(exists);
        setCheckingFeedback(false);
      }
    };

    checkForExistingFeedback();
  }, [issueId, employeeUuid, isClosedOrResolved]);

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <span
          className={`px-2 py-0.5 text-xs font-medium rounded-full 
          ${getStatusBadgeColor(status)}`}
        >
          {status === "resolved" ? "Resolved" : status === "closed" ? "Closed" : "Open"}
          
          {isClosedOrResolved && !checkingFeedback && !hasFeedback && issueId && employeeUuid && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 h-6 px-1.5 text-blue-600"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              <span className="text-xs">Feedback</span>
            </Button>
          )}
        </span>
        
        {updatedAt && (
          <span className="text-xs text-gray-500 ml-2">
            {formatDate(updatedAt)}
          </span>
        )}
      </div>
      
      {isClosedOrResolved && !checkingFeedback && hasFeedback && (
        <div className="text-xs text-green-600 mt-1 flex items-center">
          <CheckCircle className="h-3 w-3 mr-1" />
          <span>Feedback submitted</span>
        </div>
      )}
      
      {/* Feedback Dialog */}
      {issueId && employeeUuid && (
        <FeedbackDialog 
          isOpen={showFeedbackDialog}
          onClose={() => setShowFeedbackDialog(false)}
          issueId={issueId}
          employeeUuid={employeeUuid}
        />
      )}
    </div>
  );
};

export default MobileIssueStatus;
