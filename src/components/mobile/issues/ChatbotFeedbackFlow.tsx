
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
        { id: 'was_extremely_rude', label: 'Agent was extremely rude / एजेंट ने बहुत गलत व्यवहार किया' },
        { id: 'completely_ignored', label: 'Completely ignored me / मुझे पूरी तरह नज़रअंदाज़ कर दिया' },
        { id: 'provided_wrong_info', label: 'Provided wrong information / गलत जानकारी दी' }
      ];
    } else if (isPositive) {
      return rating === 5 ? 
        [
          { id: 'exceptional_service', label: 'Exceptional service / उत्कृष्ट सेवा' },
          { id: 'went_above_beyond', label: 'Went above and beyond / अपेक्षा से अधिक मदद की' },
        ] : 
        [
          { id: 'spoke_nicely', label: 'Agent spoke nicely / एजेंट ने अच्छे से बात की' },
          { id: 'helped_quickly', label: 'Helped quickly / जल्दी मदद की' },
        ];
    } else {
      return [
        { id: 'was_rude', label: 'Agent was rude / एजेंट ने गलत तरीके से बात की' },
        { id: 'didnt_respond', label: 'Didn\'t respond / कोई जवाब नहीं मिला' },
        { id: 'didnt_help', label: 'Didn\'t help / मदद नहीं की' },
      ];
    }
  } else { // Resolution options
    if (isVeryUnhappy) {
      return [
        { id: 'made_worse', label: 'Made issue worse / समस्या और बिगड़ गई' },
        { id: 'completely_unresolved', label: 'Completely unresolved / बिलकुल हल नहीं हुई' },
        { id: 'need_urgent_help', label: 'Need urgent help / तत्काल सहायता चाहिए' },
      ];
    } else if (isPositive) {
      return rating === 5 ? 
        [
          { id: 'perfectly_solved', label: 'Perfectly solved / बिलकुल सही तरीके से हल किया' },
          { id: 'very_clear_process', label: 'Very clear process / बहुत स्पष्ट प्रक्रिया' },
        ] : 
        [
          { id: 'problem_solved', label: 'Problem solved / समस्या हल हुई' },
          { id: 'easy_to_understand', label: 'Easy to understand / समझ में आ गया' },
        ];
    } else {
      return [
        { id: 'took_too_long', label: 'Took too long / बहुत समय लगा' },
        { id: 'still_not_resolved', label: 'Still not resolved / समस्या अब भी बाकी है' },
        { id: 'confusing_process', label: 'Confusing process / समझ में नहीं आया' },
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
              What is this feedback about?<br />
              <span className="text-sm font-normal">यह प्रतिक्रिया किस बारे में है?</span>
            </h3>
            <div className="flex flex-col space-y-3 w-full">
              <Button
                onClick={() => handleCategorySelect('agent')}
                className="flex items-center justify-center px-4 py-6 w-full"
                style={{ backgroundColor: rating ? ratingOptions.find(opt => opt.value === rating)?.color : undefined }}
              >
                Agent / एजेंट के बारे में
              </Button>
              <Button
                onClick={() => handleCategorySelect('resolution')}
                className="flex items-center justify-center px-4 py-6 w-full"
                style={{ backgroundColor: rating ? ratingOptions.find(opt => opt.value === rating)?.color : undefined }}
              >
                Resolution / समस्या के हल के बारे में
              </Button>
            </div>
          </div>
        );

      case 'reason':
        return (
          <div className="flex flex-col items-center text-center space-y-6">
            <h3 className="text-lg font-medium">
              What best describes it?<br />
              <span className="text-sm font-normal">कृपया कारण चुनें</span>
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
              Anything else you'd like to share?<br />
              <span className="text-sm font-normal">कुछ और बताना चाहेंगे?</span>
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
