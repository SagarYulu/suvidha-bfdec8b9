
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
type FeedbackStep = 'rating' | 'category' | 'reason' | 'comment' | 'completed';

// Define reason options based on category and rating
const getReasonOptions = (category: 'agent' | 'resolution' | null, rating: number | null) => {
  if (!category || rating === null) return [];
  
  // Very happy (5) and happy (4) are considered positive
  const isPositive = rating >= 4;
  // Very unhappy (1) gets special options
  const isVeryUnhappy = rating === 1;
  const isNeutral = rating === 3;
  const isUnhappy = rating === 2;
  
  if (category === 'agent') {
    if (isVeryUnhappy) {
      return [
        { id: 'was_rude', label: 'Agent was rude' },
        { id: 'no_response', label: 'No response' },
        { id: 'wrong_info', label: 'Wrong information' }
      ];
    } else if (isUnhappy) {
      return [
        { id: 'not_helpful', label: 'Not helpful' },
        { id: 'confusing', label: 'Confusing replies' },
      ];
    } else if (isNeutral) {
      return [
        { id: 'slow', label: 'Slow response' },
      ];
    } else if (rating === 4) { // Happy
      return [
        { id: 'good', label: 'Good response' },
        { id: 'clear', label: 'Clear resolution' },
      ];
    } else { // Very Happy (5)
      return [
        { id: 'very_helpful', label: 'Very helpful' },
        { id: 'quick', label: 'Quick resolution' },
      ];
    }
  } else { // Resolution options
    if (isVeryUnhappy) {
      return [
        { id: 'no_fix', label: 'Problem not fixed' },
        { id: 'worse', label: 'Made things worse' },
        { id: 'need_help', label: 'Still need help' },
      ];
    } else if (isUnhappy) {
      return [
        { id: 'not_fixed', label: 'Not fully fixed' },
        { id: 'unclear', label: 'Solution unclear' },
      ];
    } else if (isNeutral) {
      return [
        { id: 'slow_fix', label: 'Took too long' },
      ];
    } else if (rating === 4) { // Happy
      return [
        { id: 'clear_solution', label: 'Clear solution' },
      ];
    } else { // Very Happy (5)
      return [
        { id: 'fixed', label: 'Issue fixed' },
        { id: 'fast', label: 'Fixed quickly' },
      ];
    }
  }
};

// Define the rating options with mood labels and emojis
const ratingOptions = [
  { value: 5, emoji: '🤩', label: 'Very Happy', 
    gradient: 'bg-gradient-to-r from-amber-300 to-yellow-600' }, 
  { value: 4, emoji: '🙂', label: 'Happy', 
    gradient: 'bg-gradient-to-r from-amber-200 to-yellow-500' },
  { value: 3, emoji: '😐', label: 'Neutral', 
    gradient: 'bg-gradient-to-r from-amber-100 to-yellow-400' },
  { value: 2, emoji: '😕', label: 'Unhappy', 
    gradient: 'bg-gradient-to-r from-amber-100 to-yellow-300' },
  { value: 1, emoji: '😠', label: 'Very Unhappy', 
    gradient: 'bg-gradient-to-r from-amber-50 to-yellow-200' },
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
  const [category, setCategory] = useState<'agent' | 'resolution' | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset the form when closed
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      setCurrentStep('rating');
      setRating(null);
      setCategory(null);
      setReason(null);
      setComment('');
      onClose();
    }
  }, [isSubmitting, onClose]);

  // Handle rating selection
  const handleRatingSelect = useCallback((value: number) => {
    setRating(value);
    setCurrentStep('category');
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((value: 'agent' | 'resolution') => {
    setCategory(value);
    setCurrentStep('reason');
  }, []);

  // Handle reason selection
  const handleReasonSelect = useCallback((value: string) => {
    setReason(value);
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
      // Prepare the metadata object 
      const metadataObj = {
        category,
        reason
      };
      
      console.log("Submitting feedback with:", { 
        ticketId, 
        employeeUuid, 
        resolverUuid, 
        rating, 
        comment: comment.trim() || null,
        metadata: metadataObj 
      });
      
      const { data, error } = await supabase
        .from("resolution_feedback")
        .insert({
          ticket_id: ticketId,
          employee_uuid: employeeUuid,
          resolver_uuid: resolverUuid || null,
          rating: rating,
          comment: comment.trim() || null,
          metadata: metadataObj
        })
        .select();

      if (error) {
        console.error("Error submitting feedback:", error);
        toast({
          title: "Error",
          description: "Failed to submit feedback. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log("Feedback submitted successfully:", data);
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
  }, [rating, category, reason, comment, ticketId, employeeUuid, resolverUuid, onFeedbackSubmitted, handleClose]);
  
  // Get the selected rating gradient
  const getRatingGradient = () => {
    if (rating === null) return 'bg-gradient-to-r from-amber-300 to-yellow-600'; // Default golden gradient
    return ratingOptions.find(opt => opt.value === rating)?.gradient || 'bg-gradient-to-r from-amber-300 to-yellow-600';
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'rating':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium text-gray-800">
              How was your experience?<br />
              <span className="text-sm font-normal text-gray-600">आपका अनुभव कैसा रहा?</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              {ratingOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleRatingSelect(option.value)}
                  className={`${option.gradient} flex items-center justify-between px-4 py-6 w-full text-gray-800 hover:opacity-90 transition-all duration-200 shadow-md`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{option.emoji}</span>
                    <span className="text-gray-800 font-medium">{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium text-gray-800">
              What is this about?<br />
              <span className="text-sm font-normal text-gray-600">यह किस बारे में है?</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              <Button
                onClick={() => handleCategorySelect('agent')}
                className={`${getRatingGradient()} flex items-center justify-center px-4 py-6 w-full shadow-md text-gray-800 hover:opacity-90 transition-all duration-200`}
              >
                About the agent / एजेंट के बारे में
              </Button>
              <Button
                onClick={() => handleCategorySelect('resolution')}
                className={`${getRatingGradient()} flex items-center justify-center px-4 py-6 w-full shadow-md text-gray-800 hover:opacity-90 transition-all duration-200`}
              >
                About the solution / समाधान के बारे में
              </Button>
            </div>
          </div>
        );

      case 'reason':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium text-gray-800">
              Tell us more<br />
              <span className="text-sm font-normal text-gray-600">और बताएं</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              {getReasonOptions(category, rating).map((option) => (
                <Button
                  key={option.id}
                  onClick={() => handleReasonSelect(option.id)}
                  className={`${getRatingGradient()} flex items-center justify-center px-4 py-4 w-full text-sm text-gray-800 hover:opacity-90 shadow-md transition-all duration-200`}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        );

      case 'comment':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium text-gray-800">
              Anything else?<br />
              <span className="text-sm font-normal text-gray-600">कुछ और?</span>
            </h3>
            <Textarea
              placeholder="Your comments (optional) / आपकी टिप्पणियां (वैकल्पिक)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none h-32 border-amber-300 focus:border-amber-500 focus:ring focus:ring-amber-200 transition-all duration-200 text-gray-800"
            />
            <Button
              onClick={handleSubmit}
              className={`${getRatingGradient()} w-full py-6 shadow-md text-gray-800 hover:opacity-90 transition-all duration-200`}
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

  // Memoize the dialog content
  const dialogContent = React.useMemo(() => (
    <DialogContent className="sm:max-w-md p-6 rounded-2xl border-amber-100 shadow-lg bg-white">
      {renderStepContent()}
    </DialogContent>
  ), [currentStep, rating, category, comment, isSubmitting]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      {dialogContent}
    </Dialog>
  );
};

export default React.memo(ChatbotFeedbackFlow);
