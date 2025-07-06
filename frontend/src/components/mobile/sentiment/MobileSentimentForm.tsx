
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';

interface MobileSentimentFormProps {
  onSubmit: (data: SentimentData) => void;
  isLoading?: boolean;
}

interface SentimentData {
  rating: number;
  feedback: string;
  tags: string[];
}

const MobileSentimentForm: React.FC<MobileSentimentFormProps> = ({
  onSubmit,
  isLoading = false
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit({
        rating,
        feedback,
        tags: selectedTags
      });
    }
  };

  const getRatingEmoji = (rating: number) => {
    if (rating === 1) return "😡";
    if (rating === 2) return "😔";
    if (rating === 3) return "😐";
    if (rating === 4) return "🙂";
    return "😃";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Share Your Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Section */}
          <div className="text-center">
            <Label className="text-base font-medium mb-4 block">
              How are you feeling today?
            </Label>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-2"
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`h-10 w-10 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-4xl mb-2">
                {getRatingEmoji(rating)}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div>
            <Label className="text-base font-medium mb-3 block">
              What areas would you like to comment on? (Optional)
            </Label>
            <div className="flex flex-wrap gap-2">
              {predefinedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-2 rounded-full text-sm border transition-colors ${
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

          {/* Feedback Section */}
          <div>
            <Label htmlFor="feedback" className="text-base font-medium mb-2 block">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="feedback"
              placeholder="Share your thoughts, suggestions, or concerns..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] text-base"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base"
            disabled={rating === 0 || isLoading}
          >
            {isLoading ? (
              'Submitting...'
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Submit Feedback
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MobileSentimentForm;
