
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Smile, Meh, Frown, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackCollectionCardProps {
  issueId: string;
  onSubmit?: (feedback: any) => void;
  className?: string;
}

const FeedbackCollectionCard: React.FC<FeedbackCollectionCardProps> = ({ 
  issueId, 
  onSubmit,
  className = ""
}) => {
  const [sentiment, setSentiment] = useState<'happy' | 'neutral' | 'sad' | null>(null);
  const [feedbackOption, setFeedbackOption] = useState<string>('');
  const [additionalComments, setAdditionalComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sentimentOptions = [
    { value: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500' },
    { value: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500' },
    { value: 'sad', icon: Frown, label: 'Unsatisfied', color: 'text-red-500' }
  ];

  const feedbackOptions = [
    'Issue resolved quickly',
    'Clear communication',
    'Professional service',
    'Could be faster',
    'Need better updates',
    'Not satisfied with resolution'
  ];

  const handleSubmit = async () => {
    if (!sentiment) {
      toast({
        title: "Please select your satisfaction level",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const feedbackData = {
        issueId,
        sentiment,
        feedbackOption,
        additionalComments,
        submittedAt: new Date().toISOString()
      };

      // Submit feedback via API
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(feedbackData)
      });

      if (response.ok) {
        toast({
          title: "Thank you for your feedback!",
          description: "Your feedback helps us improve our service."
        });
        
        if (onSubmit) {
          onSubmit(feedbackData);
        }
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-center text-lg">
          How was your experience?
        </CardTitle>
        <p className="text-center text-sm text-gray-600">
          Please rate your satisfaction with the ticket resolution
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sentiment Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Your satisfaction level:</label>
          <div className="flex justify-center space-x-4">
            {sentimentOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => setSentiment(option.value as any)}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    sentiment === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <IconComponent 
                    className={`h-8 w-8 ${
                      sentiment === option.value ? 'text-blue-500' : option.color
                    }`} 
                  />
                  <span className="text-xs mt-1">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Options */}
        <div className="space-y-3">
          <label className="text-sm font-medium">What went well?</label>
          <div className="grid grid-cols-1 gap-2">
            {feedbackOptions.map((option) => (
              <button
                key={option}
                onClick={() => setFeedbackOption(option)}
                className={`text-left p-2 rounded border text-sm transition-all ${
                  feedbackOption === option
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Additional Comments */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional comments (optional):</label>
          <Textarea
            placeholder="Tell us more about your experience..."
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting || !sentiment}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default FeedbackCollectionCard;
