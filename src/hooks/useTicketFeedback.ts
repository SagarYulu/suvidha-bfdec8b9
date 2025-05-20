
import { useState, useEffect } from "react";
import { checkFeedbackExists } from "@/services/resolutionFeedbackService";

export const useTicketFeedback = (ticketId: string) => {
  const [hasFeedback, setHasFeedback] = useState<boolean | null>(null);
  const [isCheckingFeedback, setIsCheckingFeedback] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const checkFeedback = async () => {
      if (!ticketId) return;
      
      setIsCheckingFeedback(true);
      try {
        const feedbackExists = await checkFeedbackExists(ticketId);
        setHasFeedback(feedbackExists);
      } catch (error) {
        console.error("Error checking feedback status:", error);
      } finally {
        setIsCheckingFeedback(false);
      }
    };

    checkFeedback();
  }, [ticketId]);

  const openFeedbackForm = () => {
    setShowFeedbackForm(true);
  };

  const closeFeedbackForm = () => {
    setShowFeedbackForm(false);
  };

  const handleFeedbackSubmitted = () => {
    setHasFeedback(true);
    setShowFeedbackForm(false);
  };

  return {
    hasFeedback,
    isCheckingFeedback,
    showFeedbackForm,
    openFeedbackForm,
    closeFeedbackForm,
    handleFeedbackSubmitted
  };
};
