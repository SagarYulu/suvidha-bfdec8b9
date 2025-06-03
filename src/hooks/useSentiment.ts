
import { useState, useEffect } from 'react';
import { sentimentService } from '@/services/sentimentService';
import { toast } from '@/hooks/use-toast';

export const useSentiment = () => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTags();
    loadSentimentData();
  }, []);

  const loadTags = async () => {
    try {
      const tagsData = await sentimentService.getTags();
      setTags(tagsData || []);
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  const loadSentimentData = async () => {
    setIsLoading(true);
    try {
      const data = await sentimentService.getSentimentData();
      setSentimentData(data || []);
    } catch (error) {
      setError('Failed to load sentiment data');
      console.error('Error loading sentiment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleFeedbackChange = (newFeedback: string) => {
    setFeedback(newFeedback);
  };

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleAnalyzeFeedback = async () => {
    if (!feedback.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const suggestions = await sentimentService.analyzeFeedback(feedback);
      setSuggestedTags(suggestions || []);
    } catch (error) {
      console.error('Error analyzing feedback:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await sentimentService.submitFeedback({
        rating,
        feedback,
        tags: selectedTags
      });
      
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });
      
      // Reset form
      setRating(5);
      setFeedback('');
      setSelectedTags([]);
      setSuggestedTags([]);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
    sentimentData,
    isLoading,
    error,
    handleRatingChange,
    handleFeedbackChange,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit
  };
};
