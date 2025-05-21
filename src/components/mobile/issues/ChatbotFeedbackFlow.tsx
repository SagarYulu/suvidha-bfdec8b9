
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, MessageSquare, Star, ThumbsUp, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ChatbotFeedbackFlowProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: string;
  resolverUuid?: string | null;
  employeeUuid: string;
  onFeedbackSubmitted: () => void;
}

const ChatbotFeedbackFlow: React.FC<ChatbotFeedbackFlowProps> = ({
  isOpen,
  onClose,
  ticketId,
  resolverUuid,
  employeeUuid,
  onFeedbackSubmitted
}) => {
  const [step, setStep] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Display feedback submission success notification
      toast({
        title: "Feedback Submitted",
        description: "Thank you for sharing your feedback!",
      });
      
      onFeedbackSubmitted();
      onClose();
      setStep(1);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state after animation completes
    setTimeout(() => {
      setStep(1);
      setRating(0);
      setComment("");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden">
        <div className="bg-blue-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            <h2 className="font-bold">Your Feedback</h2>
          </div>
          <button onClick={handleClose} className="text-white hover:text-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Rate Your Experience</h3>
                <p className="text-sm text-gray-500 mt-1">
                  How would you rate the resolution of your issue?
                </p>
              </div>
              
              <div className="flex justify-center py-4">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`mx-1 transition-all ${
                      rating >= value
                        ? "text-yellow-400 transform scale-110"
                        : "text-gray-300 hover:text-yellow-200"
                    }`}
                  >
                    <Star
                      className="h-10 w-10 fill-current"
                      strokeWidth={1}
                    />
                  </button>
                ))}
              </div>
              
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={() => setStep(2)}
                  disabled={rating === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium">Additional Feedback</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Would you like to share more about your experience? (Optional)
                </p>
              </div>
              
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the resolution..."
                className="h-32"
              />
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button 
                  variant="outline" 
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotFeedbackFlow;
