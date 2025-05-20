
import React, { useEffect, useState } from "react";
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

  // Animation state variables
  const [pulse, setPulse] = useState(false);
  const [sparkle, setSparkle] = useState(false);

  // Set up the animation cycle
  useEffect(() => {
    if (hasFeedback || isCheckingFeedback) return;
    
    // Pulse animation every 3 seconds
    const pulseInterval = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
    }, 3000);
    
    // Sparkle animation every 5 seconds
    const sparkleInterval = setInterval(() => {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 1500);
    }, 5000);
    
    return () => {
      clearInterval(pulseInterval);
      clearInterval(sparkleInterval);
    };
  }, [hasFeedback, isCheckingFeedback]);

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
        className={`
          w-full mt-2 border-amber-500 text-amber-600 hover:bg-amber-50
          ${pulse ? 'animate-[pulse_1s_ease-in-out]' : ''}
          relative overflow-hidden transition-all
          bg-gradient-to-r from-amber-50 to-amber-100
          hover:from-amber-100 hover:to-amber-200
          border-2 border-dashed
        `}
      >
        {sparkle && (
          <Sparkles className="absolute right-2 top-1 h-4 w-4 text-amber-400 animate-[fadeIn_0.5s_ease-out]" />
        )}
        <MessageSquare className={`h-4 w-4 mr-2 ${pulse ? 'text-amber-500' : 'text-amber-400'}`} />
        <span className="font-medium relative">
          Share Your Feedback / अपनी प्रतिक्रिया साझा करें
          {sparkle && (
            <span className="absolute -top-1 -right-1 text-amber-400">✨</span>
          )}
        </span>
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
