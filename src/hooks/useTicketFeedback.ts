
import { useState, useEffect } from "react";
import { checkFeedbackExists } from "@/services/resolutionFeedbackService";

export const useTicketFeedback = (ticketId: string) => {
  const [hasFeedback, setHasFeedback] = useState<boolean | null>(null);
  const [isCheckingFeedback, setIsCheckingFeedback] = useState(true);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  useEffect(() => {
    const checkFeedback = async () => {
      if (!ticketId) {
        setIsCheckingFeedback(false);
        return;
      }
      
      setIsCheckingFeedback(true);
      try {
        console.log("Checking feedback for ticket:", ticketId);
        const feedbackExists = await checkFeedbackExists(ticketId);
        console.log("Feedback exists:", feedbackExists);
        setHasFeedback(feedbackExists);
      } catch (error) {
        console.error("Error checking feedback status:", error);
        setHasFeedback(false);
      } finally {
        setIsCheckingFeedback(false);
      }
    };

    checkFeedback();
  }, [ticketId]);

  const openFeedbackForm = () => {
    console.log("Opening feedback form");
    setShowFeedbackForm(true);
  };

  const closeFeedbackForm = () => {
    console.log("Closing feedback form");
    setShowFeedbackForm(false);
  };

  const handleFeedbackSubmitted = () => {
    console.log("Feedback submitted successfully");
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
