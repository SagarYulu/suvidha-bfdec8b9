
import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, CheckCircle, Star, Loader2 } from "lucide-react";
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
  
  if (category === 'agent') {
    if (isVeryUnhappy) {
      return [
        { id: 'was_rude', label: 'Agent was rude / एजेंट ने गलत व्यवहार किया' },
        { id: 'no_response', label: 'No response / कोई जवाब नहीं' },
        { id: 'wrong_info', label: 'Wrong information / गलत जानकारी' }
      ];
    } else if (isPositive) {
      return rating === 5 ? 
        [
          { id: 'helpful', label: 'Very helpful / बहुत मददगार' },
          { id: 'friendly', label: 'Friendly behavior / दोस्ताना व्यवहार' },
        ] : 
        [
          { id: 'good', label: 'Good service / अच्छी सेवा' },
          { id: 'quick', label: 'Quick response / जल्दी जवाब' },
        ];
    } else {
      return [
        { id: 'slow', label: 'Slow response / धीमा जवाब' },
        { id: 'unhelpful', label: 'Not helpful / मददगार नहीं' },
        { id: 'confusing', label: 'Confusing replies / भ्रमित जवाब' },
      ];
    }
  } else { // Resolution options
    if (isVeryUnhappy) {
      return [
        { id: 'no_fix', label: 'Problem not fixed / समस्या हल नहीं हुई' },
        { id: 'worse', label: 'Made things worse / और बिगाड़ दिया' },
        { id: 'need_help', label: 'Still need help / अभी भी मदद चाहिए' },
      ];
    } else if (isPositive) {
      return rating === 5 ? 
        [
          { id: 'fixed', label: 'Issue fixed / समस्या हल हो गई' },
          { id: 'fast', label: 'Fixed quickly / जल्दी ठीक हुआ' },
        ] : 
        [
          { id: 'helped', label: 'Issue helped / मदद मिली' },
          { id: 'clear', label: 'Clear solution / साफ़ समाधान' },
        ];
    } else {
      return [
        { id: 'slow_fix', label: 'Took too long / बहुत समय लगा' },
        { id: 'not_fixed', label: 'Not fully fixed / पूरी तरह हल नहीं हुआ' },
        { id: 'unclear', label: 'Solution unclear / समाधान स्पष्ट नहीं था' },
      ];
    }
  }
};

// Define the rating options with mood labels and emojis only (no stars)
const ratingOptions = [
  { value: 5, emoji: '🤩', label: 'Very Happy', color: '#FFC300' },
  { value: 4, emoji: '🙂', label: 'Happy', color: '#FFD700' },
  { value: 3, emoji: '😐', label: 'Neutral', color: '#FFA500' },
  { value: 2, emoji: '😕', label: 'Unhappy', color: '#FF6A33' },
  { value: 1, emoji: '😠', label: 'Very Unhappy', color: '#FF3B30' },
];

// StarRating component - completely rewritten to properly show filled/unfilled stars
const StarRating = React.memo(({ filled, color }: { filled: number, color: string }) => {
  return (
    <div className="flex items-center justify-end space-x-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < filled ? color : 'transparent'}
          stroke={i < filled ? color : '#8E9196'}
          strokeWidth={1.5}
          className="inline-block"
        />
      ))}
    </div>
  );
});

StarRating.displayName = "StarRating";

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
      const { error } = await supabase
        .from("resolution_feedback")
        .insert({
          ticket_id: ticketId,
          employee_uuid: employeeUuid,
          resolver_uuid: resolverUuid || null,
          rating: rating,
          comment: comment.trim() || null,
          // Store additional feedback data in metadata
          metadata: {
            category,
            reason
          }
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
  }, [rating, category, reason, comment, ticketId, employeeUuid, resolverUuid, onFeedbackSubmitted, handleClose]);
  
  // Render the current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'rating':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium">
              How was your experience?<br />
              <span className="text-sm font-normal">आपका अनुभव कैसा रहा?</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              {ratingOptions.map((option) => (
                <Button
                  key={option.value}
                  onClick={() => handleRatingSelect(option.value)}
                  style={{ backgroundColor: option.color }}
                  className="flex items-center justify-between px-4 py-6 w-full text-white hover:opacity-90"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{option.emoji}</span>
                    <span>{option.label}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case 'category':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium">
              What is this about?<br />
              <span className="text-sm font-normal">यह किस बारे में है?</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              <Button
                onClick={() => handleCategorySelect('agent')}
                className="flex items-center justify-center px-4 py-6 w-full"
                style={{ backgroundColor: rating ? ratingOptions.find(opt => opt.value === rating)?.color : undefined }}
              >
                About the agent / एजेंट के बारे में
              </Button>
              <Button
                onClick={() => handleCategorySelect('resolution')}
                className="flex items-center justify-center px-4 py-6 w-full"
                style={{ backgroundColor: rating ? ratingOptions.find(opt => opt.value === rating)?.color : undefined }}
              >
                About the solution / समाधान के बारे में
              </Button>
            </div>
          </div>
        );

      case 'reason':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium">
              Tell us more<br />
              <span className="text-sm font-normal">और बताएं</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              {getReasonOptions(category, rating).map((option) => (
                <Button
                  key={option.id}
                  onClick={() => handleReasonSelect(option.id)}
                  className="flex items-center justify-center px-4 py-4 w-full text-sm text-white hover:opacity-90 text-wrap"
                  style={{ backgroundColor: rating ? ratingOptions.find(opt => opt.value === rating)?.color : undefined }}
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
            <h3 className="text-lg font-medium">
              Anything else?<br />
              <span className="text-sm font-normal">कुछ और?</span>
            </h3>
            <Textarea
              placeholder="Your comments (optional) / आपकी टिप्पणियां (वैकल्पिक)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none h-32"
            />
            <Button
              onClick={handleSubmit}
              className="w-full py-6"
              disabled={isSubmitting}
              style={{ backgroundColor: rating ? ratingOptions.find(opt => opt.value === rating)?.color : undefined }}
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
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-center">
              Thanks for your feedback!<br />
              <span className="text-sm font-normal">आपकी प्रतिक्रिया के लिए धन्यवाद!</span>
            </h3>
          </div>
        );
    }
  };

  // Memoize the dialog content
  const dialogContent = React.useMemo(() => (
    <DialogContent className="sm:max-w-md p-6 rounded-lg">
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
