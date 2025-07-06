
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, Send, MessageSquare, X } from 'lucide-react';
import { ApiClient } from '@/services/apiClient';

interface FeedbackWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string;
}

const FeedbackWidget: React.FC<FeedbackWidgetProps> = ({
  isOpen,
  onClose,
  employeeId
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const predefinedTags = [
    'Work Environment',
    'Management',
    'Workload',
    'Team Collaboration',
    'Growth Opportunities',
    'Work-Life Balance',
    'Communication',
    'Resources',
    'Recognition',
    'Training'
  ];

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      await ApiClient.post('/api/feedback', {
        employeeId,
        rating,
        feedback,
        tags: selectedTags
      });

      setIsSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setRating(0);
        setFeedback('');
        setSelectedTags([]);
        setIsSubmitted(false);
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingEmoji = (rating: number) => {
    if (rating === 1) return "😡";
    if (rating === 2) return "😔";
    if (rating === 3) return "😐";
    if (rating === 4) return "🙂";
    return "😃";
  };

  if (!isOpen) return null;

  if (isSubmitted) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 shadow-lg border-green-500">
          <CardContent className="p-6 text-center">
            <div className="text-green-600 mb-4">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-medium">Thank you!</h3>
              <p className="text-sm text-gray-600">Your feedback has been submitted.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Quick Feedback
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Rating */}
            <div className="text-center">
              <p className="text-sm font-medium mb-2">How are you feeling today?</p>
              <div className="flex justify-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="p-1"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <div className="text-2xl mb-2">
                  {getRatingEmoji(rating)}
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <p className="text-sm font-medium mb-2">Topics (Optional)</p>
              <div className="flex flex-wrap gap-1">
                {predefinedTags.slice(0, 6).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <p className="text-sm font-medium mb-2">Comment (Optional)</p>
              <Textarea
                placeholder="Share your thoughts..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="text-sm min-h-[60px]"
              />
            </div>

            {/* Submit */}
            <Button 
              onClick={handleSubmit}
              disabled={rating === 0 || isSubmitting}
              className="w-full"
              size="sm"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="h-3 w-3 mr-1" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackWidget;
