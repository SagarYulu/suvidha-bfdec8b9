
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';

interface FeedbackTextareaProps {
  feedback: string;
  isAnalyzing: boolean;
  isSubmitting: boolean;
  onFeedbackChange: (value: string) => void;
}

const FeedbackTextarea: React.FC<FeedbackTextareaProps> = ({
  feedback,
  isAnalyzing,
  isSubmitting,
  onFeedbackChange
}) => {
  return (
    <div className="bg-white/25 p-3 rounded-xl backdrop-blur-sm mt-4">
      <label className="block text-sm font-medium mb-2 text-gray-800">
        Tell us more about your experience (optional)
      </label>
      <div className="relative">
        <Textarea
          placeholder="Share your thoughts, concerns, or suggestions..."
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          className="min-h-[100px] max-h-[150px] resize-none bg-white border-none text-gray-800"
          disabled={isSubmitting}
        />
        {isAnalyzing && (
          <div className="absolute top-2 right-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackTextarea;
