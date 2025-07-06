
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, MessageSquare } from 'lucide-react';

interface FeedbackDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: FeedbackData) => void;
  isLoading?: boolean;
}

interface FeedbackData {
  rating: number;
  comment: string;
}

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit({ rating, comment });
      setRating(0);
      setComment('');
    }
  };

  const StarRating = () => (
    <div className="flex gap-1 justify-center my-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className="p-1"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          <Star
            className={`h-8 w-8 ${
              star <= (hoveredRating || rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center">
            <MessageSquare className="h-5 w-5" />
            Share Your Feedback
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-center block mb-2">
              How would you rate your experience?
            </Label>
            <StarRating />
          </div>

          <div>
            <Label htmlFor="feedback-comment">Additional Comments (Optional)</Label>
            <Textarea
              id="feedback-comment"
              placeholder="Tell us more about your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[80px] text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={rating === 0 || isLoading}
              className="flex-1"
            >
              {isLoading ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
