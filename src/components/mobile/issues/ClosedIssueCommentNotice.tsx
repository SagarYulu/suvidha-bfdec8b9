
import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, MessageSquare, CheckCircle } from "lucide-react";
import { useTicketFeedback } from "@/hooks/useTicketFeedback";
import FeedbackForm from "./FeedbackForm";
import { useAuth } from "@/contexts/AuthContext";

interface ClosedIssueCommentNoticeProps {
  isReopenable: boolean;
  onReopen: (reason: string) => void;
  ticketId: string;
  resolverUuid?: string | null;
}

const ClosedIssueCommentNotice: React.FC<ClosedIssueCommentNoticeProps> = ({
  isReopenable,
  onReopen,
  ticketId,
  resolverUuid
}) => {
  const { authState } = useAuth();
  const {
    hasFeedback,
    isCheckingFeedback,
    showFeedbackForm,
    openFeedbackForm,
    closeFeedbackForm,
    handleFeedbackSubmitted
  } = useTicketFeedback(ticketId);

  const shouldShowFeedbackButton = !isCheckingFeedback && !hasFeedback && authState.user?.id;

  return (
    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="flex gap-2 items-start">
        <AlertCircle className="text-gray-500 mt-0.5" size={18} />
        <div>
          <p className="text-gray-700">
            This issue has been closed and cannot be commented on.
          </p>
          {isReopenable && (
            <p className="text-sm text-gray-500 mt-1">
              You can reopen the issue if you have additional information or follow-up questions.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        {isReopenable && (
          <Button
            onClick={() => onReopen("Issue reopened from mobile app")}
            variant="outline"
            className="w-full sm:w-auto border-amber-500 text-amber-600 hover:bg-amber-50"
          >
            Reopen Issue / मुद्दा फिर से खोलें
          </Button>
        )}
        
        {shouldShowFeedbackButton && (
          <Button
            onClick={openFeedbackForm}
            variant="outline"
            className="w-full sm:w-auto border-yulu-dashboard-blue text-yulu-dashboard-blue hover:bg-blue-50 flex items-center gap-1"
          >
            <MessageSquare className="h-4 w-4" />
            Share Your Feedback / अपनी प्रतिक्रिया साझा करें
          </Button>
        )}
        
        {hasFeedback && (
          <Button
            variant="outline"
            className="w-full sm:w-auto border-green-500 text-green-600 hover:bg-green-50 cursor-default"
            disabled
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Feedback Submitted / प्रतिक्रिया दी गई
          </Button>
        )}
        
        {shouldShowFeedbackButton && (
          <FeedbackForm
            isOpen={showFeedbackForm}
            onClose={closeFeedbackForm}
            ticketId={ticketId}
            resolverUuid={resolverUuid}
            employeeUuid={authState.user.id}
            onFeedbackSubmitted={handleFeedbackSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default ClosedIssueCommentNotice;
