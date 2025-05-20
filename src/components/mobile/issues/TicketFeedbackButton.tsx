
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle } from "lucide-react";
import { useTicketFeedback } from "@/hooks/useTicketFeedback";
import ChatbotFeedbackFlow from "./ChatbotFeedbackFlow";

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
    return (
      <Button
        variant="outline"
        className="w-full mt-2 border-dashed border-gray-300 text-gray-400 hover:bg-transparent cursor-default"
        disabled
      >
        <div className="animate-pulse h-4 w-32 bg-gray-200 rounded"></div>
      </Button>
    );
  }

  if (hasFeedback) {
    return (
      <Button
        variant="outline"
        className="w-full mt-2 border-dashed border-amber-500 text-amber-600 hover:bg-amber-50 cursor-default"
        disabled
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Feedback Submitted / प्रतिक्रिया दी गई
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={openFeedbackForm}
        variant="outline"
        className="w-full mt-2 border-dashed border-amber-500 text-amber-600 hover:bg-amber-50"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Share Your Feedback / अपनी प्रतिक्रिया साझा करें
      </Button>

      <ChatbotFeedbackFlow
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
