
import React, { useEffect, useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useSentiment } from '@/hooks/useSentiment';
import { Loader2, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

const MobileSentimentForm: React.FC = () => {
  const {
    rating,
    feedback,
    isSubmitting,
    tags,
    selectedTags,
    suggestedTags,
    isAnalyzing,
    handleRatingChange,
    handleFeedbackChange,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit
  } = useSentiment();
  
  // Animation state for heading
  const [animateHeading, setAnimateHeading] = useState(true);
  // State for showing/hiding tag selection
  const [showTagsSection, setShowTagsSection] = useState(false);

  // Auto-analyze feedback when the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (feedback.trim().length > 20) {
        handleAnalyzeFeedback();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [feedback]);
  
  // Animate heading on load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateHeading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Auto-expand tags section when we have suggested tags
  useEffect(() => {
    if (suggestedTags.length > 0) {
      setShowTagsSection(true);
    }
  }, [suggestedTags]);

  // For custom submit with error handling
  const submitWithErrorHandling = async () => {
    try {
      await handleSubmit();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Emoji based on rating
  const getEmoji = (currentRating: number) => {
    if (currentRating === 1) return "😡";
    if (currentRating === 2) return "🙁";
    if (currentRating === 3) return "😐";
    if (currentRating === 4) return "🙂";
    return "😊";
  };

  // Mood text based on rating
  const getMoodText = (currentRating: number) => {
    if (currentRating === 1) return "Angry";
    if (currentRating === 2) return "Frustrated";
    if (currentRating === 3) return "Neutral";
    if (currentRating === 4) return "Happy";
    return "Motivated";
  };

  // Emotion description based on rating
  const getEmotionDescription = (currentRating: number) => {
    if (currentRating === 1) return "Angry, disrespected, anxious";
    if (currentRating === 2) return "Frustrated, unsatisfied, unacknowledged";
    if (currentRating === 3) return "Indifferent, routine, no specific highs/lows";
    if (currentRating === 4) return "Happy, content, comfortable";
    return "Excited, satisfied, motivated";
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <div className="text-center">
        <h2 className={cn(
          "text-xl font-semibold mb-2 text-white",
          animateHeading && "animate-pulse"
        )}>
          How are you feeling today?
        </h2>
        <p className="text-white text-sm opacity-75">Your feedback helps improve our workplace</p>
      </div>

      {/* Emoji Selection */}
      <div className="flex flex-col items-center gap-2">
        <div className="text-6xl mb-2">{getEmoji(rating)}</div>
        <p className="text-lg font-medium text-white">{getMoodText(rating)}</p>
        <p className="text-sm text-white opacity-75 text-center">{getEmotionDescription(rating)}</p>
      </div>
      
      {/* Emoji Selector */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        {[5, 4, 3, 2, 1].map((value) => (
          <button
            key={value}
            className={cn(
              "flex flex-col items-center p-3 rounded-lg transition-all",
              rating === value 
                ? "bg-white bg-opacity-30 border-2 border-white shadow-lg transform scale-110" 
                : "hover:bg-white hover:bg-opacity-10"
            )}
            onClick={() => handleRatingChange(value)}
          >
            <span className="text-2xl">{getEmoji(value)}</span>
            <span className="text-xs mt-1 text-white">{getMoodText(value)}</span>
          </button>
        ))}
      </div>
      
      {/* Hidden slider but keeping it for accessibility */}
      <div className="hidden">
        <Slider
          value={[rating]}
          min={1}
          max={5}
          step={1}
          onValueChange={(values) => handleRatingChange(values[0])}
        />
      </div>
      
      {/* Feedback Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-white">
          Tell us more about your experience (optional)
        </label>
        <div className="relative">
          <Textarea
            placeholder="Share your thoughts, concerns, or suggestions..."
            value={feedback}
            onChange={(e) => handleFeedbackChange(e.target.value)}
            className="min-h-[120px] resize-none bg-white bg-opacity-90 border-none"
            disabled={isSubmitting}
          />
          {isAnalyzing && (
            <div className="absolute top-2 right-2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        
        {/* Word count */}
        <div className="text-right text-xs text-white opacity-75 mt-1">
          {feedback.length} characters
        </div>
      </div>
      
      {/* Tags Section Button */}
      <Button
        variant="outline"
        className="w-full bg-white bg-opacity-10 border-white border-opacity-30 text-white"
        onClick={() => setShowTagsSection(!showTagsSection)}
      >
        <Tag className="w-4 h-4 mr-2" />
        {showTagsSection ? "Hide Tags" : "Select Tags"} 
        {suggestedTags.length > 0 && !showTagsSection && (
          <span className="ml-1 text-xs bg-blue-500 text-white rounded-full px-2 py-0.5">
            {suggestedTags.length} suggested
          </span>
        )}
      </Button>
      
      {/* Tags Selection */}
      {showTagsSection && tags.length > 0 && (
        <div className="bg-white bg-opacity-10 rounded-lg p-4">
          <label className="block text-sm font-medium mb-3 text-white">
            What areas does your feedback relate to?
            {suggestedTags.length > 0 && (
              <span className="text-xs text-blue-200 ml-2">
                (Suggested tags are highlighted)
              </span>
            )}
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag.name);
              const isSuggested = suggestedTags.includes(tag.name);
              
              return (
                <div
                  key={tag.id}
                  className={cn(
                    "flex items-center space-x-2 rounded-md p-2",
                    isSelected && "bg-white bg-opacity-20",
                    !isSelected && isSuggested && "border border-blue-300 border-opacity-50"
                  )}
                >
                  <Checkbox
                    id={`tag-${tag.id}`}
                    checked={isSelected}
                    onCheckedChange={() => handleTagToggle(tag.name)}
                    className={cn(
                      isSelected ? "bg-blue-500 border-blue-500" : "border-white",
                      isSuggested && !isSelected && "border-blue-300"
                    )}
                  />
                  <label
                    htmlFor={`tag-${tag.id}`}
                    className="text-sm font-medium leading-none text-white cursor-pointer flex-1"
                  >
                    {tag.name}
                    {isSuggested && !isSelected && (
                      <span className="ml-1 text-xs text-blue-200">(suggested)</span>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
          
          {/* Selected Tags Summary */}
          {selectedTags.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-white">Selected: {selectedTags.join(', ')}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Submit Button */}
      <Button 
        className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
        onClick={submitWithErrorHandling}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting...
          </>
        ) : "Submit Feedback"}
      </Button>
    </div>
  );
};

export default MobileSentimentForm;
