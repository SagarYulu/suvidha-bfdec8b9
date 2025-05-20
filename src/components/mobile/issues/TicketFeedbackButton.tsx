
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useTicketFeedback } from "@/hooks/useTicketFeedback";
import FeedbackForm from "./FeedbackForm";

interface TicketFeedbackButtonProps {
  ticketId: string;
  resolverUuid?: string | null;
  employeeUuid: string;
}

const TicketFeedbackButton: React.FC<TicketFeedbackButtonProps> = ({
  ticketId,
  resolverUuid,
  employeeUuid
}) => {
  const {
    hasFeedback,
    isCheckingFeedback,
    showFeedbackForm,
    openFeedbackForm,
    closeFeedbackForm,
    handleFeedbackSubmitted
  } = useTicketFeedback(ticketId);

  if (isCheckingFeedback) {
    return null; // Don't show anything while checking
  }

  if (hasFeedback) {
    return null; // Don't show if feedback already submitted
  }

  return (
    <>
      <Button
        onClick={openFeedbackForm}
        variant="outline"
        className="w-full mt-2 border-dashed border-yulu-dashboard-blue text-yulu-dashboard-blue hover:bg-yulu-dashboard-blue/10"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Share Your Feedback / अपनी प्रतिक्रिया साझा करें
      </Button>

      <FeedbackForm
        isOpen={showFeedbackForm}
        onClose={closeFeedbackForm}
        ticketId={ticketId}
        resolverUuid={resolverUuid}
        employeeUuid={employeeUuid}
        onFeedbackSubmitted={handleFeedbackSubmitted}
      />
    </>
  );
};

export default TicketFeedbackButton;
