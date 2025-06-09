
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Star, 
  Send, 
  CheckCircle, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Meh
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackWidgetProps {
  issueId: string;
  currentStatus: string;
  onFeedbackSubmitted?: (feedback: any) => void;
  existingFeedback?: {
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
  } | null;
  disabled?: boolean;
  className?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  issueId,
  currentStatus,
  onFeedbackSubmitted,
  existingFeedback,
  disabled = false,
  className = ''
}) => {
  const [rating, setRating] = useState<number>(existingFeedback?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [comment, setComment] = useState<string>(existingFeedback?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProvideFeedback = ['resolved', 'closed'].includes(currentStatus.toLowerCase()) && !disabled;

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please provide a rating before submitting feedback',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          issue_id: issueId,
          rating,
          comment
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Feedback submitted',
          description: 'Thank you for your feedback!'
        });
        
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(data.data);
        }
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: 'Submission failed',
        description: 'Failed to submit feedback. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingEmoji = (rating: number) => {
    if (rating <= 2) return <ThumbsDown className="h-5 w-5 text-red-500" />;
    if (rating === 3) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <ThumbsUp className="h-5 w-5 text-green-500" />;
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Very Unsatisfied';
      case 2: return 'Unsatisfied';
      case 3: return 'Neutral';
      case 4: return 'Satisfied';
      case 5: return 'Very Satisfied';
      default: return 'No rating';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-500';
    if (rating === 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (!canProvideFeedback && !existingFeedback) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Feedback can be provided once the issue is resolved
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          {existingFeedback ? 'Your Feedback' : 'Provide Feedback'}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {existingFeedback ? (
          // Display existing feedback
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Your Rating:</span>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= existingFeedback.rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getRatingEmoji(existingFeedback.rating)}
                <Badge variant="outline" className={getRatingColor(existingFeedback.rating)}>
                  {getRatingText(existingFeedback.rating)}
                </Badge>
              </div>
            </div>

            {existingFeedback.comment && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Your Comment:</h5>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <p className="text-sm text-gray-700">{existingFeedback.comment}</p>
                </div>
              </div>
            )}

            <div className="flex items-center text-xs text-gray-500">
              <CheckCircle className="h-4 w-4 mr-1" />
              Submitted on {new Date(existingFeedback.createdAt).toLocaleDateString()}
            </div>
          </div>
        ) : (
          // Feedback form
          <div className="space-y-6">
            {/* Rating Section */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-3 block">
                How satisfied are you with the resolution?
              </label>
              
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    disabled={!canProvideFeedback}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {rating > 0 && (
                <div className="flex items-center space-x-2">
                  {getRatingEmoji(rating)}
                  <span className={`text-sm font-medium ${getRatingColor(rating)}`}>
                    {getRatingText(rating)}
                  </span>
                </div>
              )}
            </div>

            {/* Comment Section */}
            <div>
              <label className="text-sm font-medium text-gray-900 mb-2 block">
                Additional Comments (Optional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts about the resolution process, agent support, or any suggestions for improvement..."
                rows={4}
                disabled={!canProvideFeedback}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {comment.length}/1000 characters
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              onClick={handleSubmitFeedback}
              disabled={!canProvideFeedback || rating === 0 || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        )}

        {/* Help Text */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Your feedback helps us improve!</strong> We use this information to enhance our support process and ensure better service quality.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackWidget;
