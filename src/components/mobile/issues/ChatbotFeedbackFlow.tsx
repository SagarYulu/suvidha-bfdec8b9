
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ChatbotFeedbackFlowProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  resolverUuid?: string | null;
  employeeUuid: string;
  onFeedbackSubmitted: () => void;
}

// Define the feedback step types
type FeedbackStep = 'rating' | 'comment' | 'completed';

// Define the rating options with mood labels and emojis
const ratingOptions = [
  { value: 5, emoji: '🤩', label: 'Very Happy', 
    gradient: 'bg-amber-400 border border-amber-500' }, 
  { value: 4, emoji: '🙂', label: 'Happy', 
    gradient: 'bg-amber-400 border border-amber-500' },
  { value: 3, emoji: '😐', label: 'Neutral', 
    gradient: 'bg-amber-400 border border-amber-500' },
  { value: 2, emoji: '😕', label: 'Unhappy', 
    gradient: 'bg-amber-400 border border-amber-500' },
  { value: 1, emoji: '😠', label: 'Very Unhappy', 
    gradient: 'bg-amber-400 border border-amber-500' },
];

const ChatbotFeedbackFlow: React.FC<ChatbotFeedbackFlowProps> = ({
  isOpen,
  onClose,
  ticketId,
  resolverUuid,
  employeeUuid,
  onFeedbackSubmitted
}) => {
  // State for the feedback flow
  const [currentStep, setCurrentStep] = useState<FeedbackStep>('rating');
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form when closed
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setCurrentStep('rating');
      setRating(null);
      setComment('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Handle rating selection
  const handleRatingSelect = useCallback((value: number) => {
    setRating(value);
    setCurrentStep('comment');
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (rating === null) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("resolution_feedback")
        .insert({
          ticket_id: ticketId,
          employee_uuid: employeeUuid,
          resolver_uuid: resolverUuid || null,
          rating: rating,
          comment: comment.trim() || null
        });

      if (error) {
        console.error("Error submitting feedback:", error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      } else {
        setCurrentStep('completed');
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Thank you for your feedback!",
          });
          onFeedbackSubmitted();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, comment, ticketId, employeeUuid, resolverUuid, onFeedbackSubmitted, handleClose]);
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'rating':
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <h3 className="text-lg font-medium text-gray-800">
              How was your experience?<br />
              <span className="text-sm font-normal text-gray-600">आपका अनुभव कैसा रहा?</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              {ratingOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleRatingSelect(option.value)}
                  className={`${option.gradient} flex items-center justify-start px-4 py-5 w-full hover:opacity-90 transition-all shadow-sm`}
                >
                  <span className="text-xl mr-3">{option.emoji}</span>
                  <span className="font-medium text-gray-800">{option.label}</span>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'comment':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium text-gray-800">
              Any comments?<br />
              <span className="text-sm font-normal text-gray-600">कोई टिप्पणी?</span>
            </h3>
            <Textarea
              placeholder="Share your thoughts (optional) / अपने विचार साझा करें (वैकल्पिक)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none h-32 border-amber-300 focus:border-amber-500 focus:ring-amber-200 text-gray-800"
            />
            <Button
              onClick={handleSubmit}
              className="bg-amber-400 hover:bg-amber-500 w-full py-6 text-gray-800 shadow-sm border border-amber-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit / जमा करें"
              )}
            </Button>
          </div>
        );

      case 'completed':
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="bg-amber-100 rounded-full p-4">
              <CheckCircle className="h-10 w-10 text-amber-500" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-800">
              Thanks for your feedback!<br />
              <span className="text-sm font-normal text-gray-600">आपकी प्रतिक्रिया के लिए धन्यवाद!</span>
            </h3>
          </div>
        );
    }
  };

  // Dialog content
  const dialogContent = (
    <DialogContent className="sm:max-w-md p-6 rounded-2xl bg-white border-amber-100 shadow-lg">
      {renderStepContent()}
    </DialogContent>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {dialogContent}
    </Dialog>
  );
};

export default React.memo(ChatbotFeedbackFlow);
