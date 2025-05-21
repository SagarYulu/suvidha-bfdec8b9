
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
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
    <div className="relative mt-2">
      <label 
        htmlFor="feedback" 
        className="block text-sm font-medium text-gray-800 mb-2"
      >
        Your Feedback
      </label>
      <Textarea
        id="feedback"
        value={feedback}
        onChange={(e) => onFeedbackChange(e.target.value)}
        placeholder="Tell us about your experience..."
        disabled={isSubmitting}
        className={cn(
          "min-h-[100px] resize-none border border-amber-300 bg-white/80 text-gray-800 focus-visible:ring-amber-500",
          isAnalyzing ? "pr-10" : ""
        )}
      />
      {isAnalyzing && (
        <div className="absolute right-3 top-9">
          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
        </div>
      )}
      <p className="text-xs text-gray-700 mt-1">
        Share your thoughts (optional)
      </p>
    </div>
  );
};

export default FeedbackTextarea;
