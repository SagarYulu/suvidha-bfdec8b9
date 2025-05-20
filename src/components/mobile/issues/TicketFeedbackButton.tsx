
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, Sparkles } from "lucide-react";
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
        className="w-full mt-2 border-dashed border-amber-500 text-gray-800 hover:bg-amber-50 cursor-default"
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
        className="w-full mt-2 border-dashed border-amber-500 relative overflow-hidden group animate-pulse-slow"
        style={{
          background: "linear-gradient(135deg, #FFF3C4 0%, #F59E0B 100%)",
        }}
      >
        <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors duration-300"></div>
        
        {/* Sparkle animations */}
        <span className="absolute top-1 left-4 animate-sparkle-1 text-yellow-300">
          <Sparkles className="h-3 w-3" />
        </span>
        <span className="absolute bottom-1 right-4 animate-sparkle-2 text-yellow-300">
          <Sparkles className="h-3 w-3" />
        </span>
        
        <MessageSquare className="h-4 w-4 mr-2 text-gray-800" />
        <span className="text-gray-800 font-medium">Share Your Feedback / अपनी प्रतिक्रिया साझा करें</span>
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
