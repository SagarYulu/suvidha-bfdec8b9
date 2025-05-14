
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { 
  analyzeSentiment, 
  submitSentiment, 
  fetchSentimentTags,
  SentimentRating,
  SentimentTag,
  SentimentAnalysisResult
} from '@/services/sentimentService';

export const useSentiment = () => {
  const [rating, setRating] = useState<number>(3);
  const [feedback, setFeedback] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [tags, setTags] = useState<SentimentTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { authState } = useAuth();

  useEffect(() => {
    const loadTags = async () => {
      const sentimentTags = await fetchSentimentTags();
      setTags(sentimentTags);
    };
    
    loadTags();
  }, []);

  const handleRatingChange = (value: number) => {
    setRating(value);
  };

  const handleFeedbackChange = (value: string) => {
    setFeedback(value);
    
    // Reset analysis if feedback is cleared
    if (!value.trim()) {
      setAnalysisResult(null);
      setSuggestedTags([]);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleAnalyzeFeedback = async () => {
    if (!feedback.trim()) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeSentiment(feedback);
      setAnalysisResult(result);
      setSuggestedTags(result.suggested_tags || []);
      
      // Auto-select suggested tags
      setSelectedTags(result.suggested_tags || []);
      
      // If strongly negative sentiment, adjust rating
      if (result.sentiment_score !== null && result.sentiment_score <= -0.7 && rating > 2) {
        setRating(2);
      }
      
      // If strongly positive sentiment, adjust rating
      if (result.sentiment_score !== null && result.sentiment_score >= 0.7 && rating < 4) {
        setRating(4);
      }
      
      // Alert about urgent issues
      if (result.flag_urgent) {
        toast({
          title: "Urgent Issue Detected",
          description: "This feedback appears to contain an urgent issue that may require immediate attention.",
          variant: "destructive"
        });
      }
      
      // Alert about abusive language
      if (result.flag_abusive) {
        toast({
          title: "Potential Inappropriate Content",
          description: "This feedback may contain inappropriate or abusive language.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      toast({
        title: "Analysis Failed",
        description: "Unable to analyze feedback. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit feedback.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Extract user metadata from the authentication state
      const userData = {
        city: authState.user.city as string | undefined,
        cluster: authState.user.cluster as string | undefined,
        role: authState.user.role as string | undefined
      };
      
      const sentimentData: SentimentRating = {
        employee_id: authState.user.id,
        rating,
        feedback: feedback.trim() || undefined,
        city: userData.city,
        cluster: userData.cluster,
        role: userData.role,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sentiment_score: analysisResult?.sentiment_score || undefined,
        sentiment_label: analysisResult?.sentiment_label || undefined
      };
      
      const { success, error } = await submitSentiment(sentimentData);
      
      if (success) {
        toast({
          title: "Thank You",
          description: "Your feedback has been submitted successfully!",
          variant: "default"
        });
        
        // Reset form
        setRating(3);
        setFeedback('');
        setSelectedTags([]);
        setSuggestedTags([]);
        setAnalysisResult(null);
      } else {
        throw new Error(error);
      }
    } catch (error) {
      console.error("Error submitting sentiment:", error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit your feedback. Please try again.",
        variant: "destructive"
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
    handleRatingChange,
    handleFeedbackChange,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit
  };
};
