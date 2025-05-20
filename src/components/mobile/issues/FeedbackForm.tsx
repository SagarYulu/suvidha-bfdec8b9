
import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import FeedbackStars from "./FeedbackStars";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  resolverUuid?: string | null;
  employeeUuid: string;
  onFeedbackSubmitted: () => void;
}

// Separate component for the success screen to avoid unnecessary re-renders
const SuccessScreen = React.memo(() => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="bg-green-100 rounded-full p-4 mb-4">
      <Check className="h-10 w-10 text-green-500" />
    </div>
    <h3 className="text-lg font-medium text-center">Feedback Submitted!</h3>
    <p className="text-sm text-gray-500 text-center mt-2">Thank you for sharing your experience.</p>
  </div>
));

// Separate component for the form content to avoid unnecessary re-renders
const FeedbackFormContent = React.memo(({ 
  rating, 
  comment, 
  isSubmitting, 
  onRatingChange, 
  onCommentChange, 
  onSubmit, 
  onCancel 
}: {
  rating: number;
  comment: string;
  isSubmitting: boolean;
  onRatingChange: (rating: number) => void;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) => {
  // Get button color based on current rating
  const buttonColor = useMemo(() => {
    switch(rating) {
      case 1: return "#FF3B30"; // Red
      case 2: return "#FF6A33"; // Orange-Red
      case 3: return "#FFA500"; // Orange
      case 4: return "#FFD700"; // Yellow-Orange
      case 5: return "#FFC300"; // Golden
      default: return "#1E40AF"; // Default Yulu blue
    }
  }, [rating]);

  return (
    <div className="flex flex-col items-center space-y-6 py-4">
      <FeedbackStars 
        rating={rating} 
        onChange={onRatingChange} 
        size={32} 
      />
      
      <Textarea
        placeholder="Tell us what could have been better (optional) / हमें बताएं कि क्या बेहतर हो सकता था (वैकल्पिक)"
        value={comment}
        onChange={(e) => onCommentChange(e.target.value)}
        className="w-full resize-none border-gray-300 focus:border-gray-400 focus:ring-gray-400"
      />

      <div className="flex w-full justify-end space-x-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Cancel / रद्द करें
        </Button>
        <Button
          onClick={onSubmit}
          disabled={rating === 0 || isSubmitting}
          style={{ 
            backgroundColor: rating > 0 ? buttonColor : undefined,
            opacity: rating === 0 ? 0.7 : 1,
          }}
          className="text-white hover:opacity-90 transition-opacity"
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
    </div>
  );
});

FeedbackFormContent.displayName = "FeedbackFormContent";
SuccessScreen.displayName = "SuccessScreen";

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  isOpen,
  onClose,
  ticketId,
  resolverUuid,
  employeeUuid,
  onFeedbackSubmitted
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  const handleCommentChange = useCallback((newComment: string) => {
    setComment(newComment);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting",
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
        setIsSubmitted(true);
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Thank you for your feedback!",
          });
          onFeedbackSubmitted();
          onClose();
        }, 1000);
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
  }, [rating, comment, ticketId, employeeUuid, resolverUuid, onFeedbackSubmitted, onClose]);

  const handleDialogClose = useCallback(() => {
    if (!isSubmitting) {
      setRating(0);
      setComment("");
      setIsSubmitted(false);
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md p-6 rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Share Your Feedback / अपनी प्रतिक्रिया साझा करें
          </DialogTitle>
        </DialogHeader>

        {isSubmitted ? (
          <SuccessScreen />
        ) : (
          <FeedbackFormContent
            rating={rating}
            comment={comment}
            isSubmitting={isSubmitting}
            onRatingChange={handleRatingChange}
            onCommentChange={handleCommentChange}
            onSubmit={handleSubmit}
            onCancel={handleDialogClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackForm;
