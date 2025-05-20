
import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

import { useRatingState } from './sentiment/useRatingState';
import { useFeedbackState } from './sentiment/useFeedbackState';
import { useTagState } from './sentiment/useTagState';
import { useSentimentAnalysis } from './sentiment/useSentimentAnalysis';
import { useSentimentSubmission } from './sentiment/useSentimentSubmission';
import { useTagLoading } from './sentiment/useTagLoading';

export const useSentiment = () => {
  // Use our smaller, focused hooks
  const { rating, setRating, handleRatingChange, getEmotionBasedTags } = useRatingState();
  const { tags, setTags, selectedTags, setSelectedTags, suggestedTags, setSuggestedTags, handleTagToggle } = useTagState();
  const { feedback, setFeedback, isAnalyzing, setIsAnalyzing, handleFeedbackChange } = useFeedbackState();
  
  // Load tags
  useTagLoading(setTags);
  
  // Sentiment analysis
  const { analysisResult, handleAnalyzeFeedback } = useSentimentAnalysis(
    feedback, 
    setIsAnalyzing, 
    rating, 
    setRating, 
    setSuggestedTags, 
    setSelectedTags,
    getEmotionBasedTags
  );
  
  // Sentiment submission
  const { isSubmitting, handleSubmit } = useSentimentSubmission(rating, feedback, selectedTags);
  
  // Wrapper functions that combine the individual hook functions
  const handleRatingChangeWrapper = (value: number) => {
    handleRatingChange(value, setSuggestedTags);
  };
  
  const handleFeedbackChangeWrapper = (value: string) => {
    handleFeedbackChange(value, analysisResult, setSuggestedTags);
  };
  
  // Auto-analyze feedback when the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (feedback.trim().length > 20) {
        handleAnalyzeFeedback();
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [feedback]);
  
  // Reset form after successful submission
  const handleSubmitWrapper = async () => {
    try {
      const success = await handleSubmit();
      if (success) {
        // Reset form
        setRating(3);
        setFeedback('');
        setSelectedTags([]);
        setSuggestedTags([]);
      }
    } catch (error) {
      console.error("Error in handleSubmitWrapper:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  };

  return {
    rating,
    feedback,
    isSubmitting,
    tags,
    selectedTags,
    suggestedTags,
    isAnalyzing,
    handleRatingChange: handleRatingChangeWrapper,
    handleFeedbackChange: handleFeedbackChangeWrapper,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit: handleSubmitWrapper
  };
};
