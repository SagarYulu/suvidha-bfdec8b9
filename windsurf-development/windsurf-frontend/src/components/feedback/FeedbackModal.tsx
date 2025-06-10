
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiService } from "@/services/apiService";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId: string;
  agentName?: string;
  agentId?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  issueId,
  agentName,
  agentId
}) => {
  const [sentiment, setSentiment] = useState<string>('');
  const [feedbackOption, setFeedbackOption] = useState<string>('');
  const [additionalComments, setAdditionalComments] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sentimentOptions = [
    { value: 'positive', label: 'Very Satisfied', icon: ThumbsUp, color: 'text-green-600' },
    { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-yellow-600' },
    { value: 'negative', label: 'Dissatisfied', icon: ThumbsDown, color: 'text-red-600' }
  ];

  const feedbackOptions = [
    'Quick Resolution',
    'Professional Service',
    'Clear Communication',
    'Follow-up Required',
    'Slow Response',
    'Unclear Solution',
    'Need Better Support'
  ];

  const handleSubmit = async () => {
    if (!sentiment || !feedbackOption) {
      toast({
        title: "Incomplete Feedback",
        description: "Please select both sentiment and feedback option",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.submitFeedback({
        issueId,
        sentiment,
        feedbackOption,
        additionalComments,
        agentName,
        agentId
      });

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!"
      });

      onClose();
      // Reset form
      setSentiment('');
      setFeedbackOption('');
      setAdditionalComments('');
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Rate Your Experience</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Sentiment Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">How satisfied are you with the resolution?</Label>
            <RadioGroup value={sentiment} onValueChange={setSentiment}>
              <div className="grid grid-cols-1 gap-3">
                {sentimentOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <div key={option.value} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Icon className={`h-5 w-5 ${option.color}`} />
                      <Label htmlFor={option.value} className="cursor-pointer flex-1">{option.label}</Label>
                    </div>
                  );
                })}
              </div>
            </RadioGroup>
          </div>

          {/* Feedback Options */}
          <div>
            <Label className="text-sm font-medium mb-3 block">What best describes your experience?</Label>
            <RadioGroup value={feedbackOption} onValueChange={setFeedbackOption}>
              <div className="grid grid-cols-1 gap-2">
                {feedbackOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="cursor-pointer text-sm">{option}</Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Additional Comments */}
          <div>
            <Label htmlFor="comments" className="text-sm font-medium mb-2 block">Additional Comments (Optional)</Label>
            <Textarea
              id="comments"
              placeholder="Share any additional feedback..."
              value={additionalComments}
              onChange={(e) => setAdditionalComments(e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackModal;
