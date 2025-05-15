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
    
    // Update suggested tags based on rating
    const emotionBasedTags = getEmotionBasedTags(value);
    if (emotionBasedTags.length > 0) {
      setSuggestedTags(prev => {
        // Combine AI suggested tags with emotion-based tags
        const combined = [...new Set([...prev, ...emotionBasedTags])];
        return combined;
      });
    }
  };
  
  // Get suggested tags based on emotion rating
  const getEmotionBasedTags = (value: number): string[] => {
    switch (value) {
      case 5: // Motivated
        return ["Career Growth", "Team"];
      case 4: // Happy
        return ["Work-Life Balance"];
      case 3: // Neutral
        return [];
      case 2: // Frustrated
        return ["Workload", "Communication"];
      case 1: // Angry
        return ["Manager"];
      default:
        return [];
    }
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
    if (!feedback.trim() || feedback.trim().length < 10) return;
    
    setIsAnalyzing(true);
    
    try {
      const result = await analyzeSentiment(feedback);
      setAnalysisResult(result);
      
      // Include AI suggested tags
      if (result.suggested_tags && result.suggested_tags.length > 0) {
        setSuggestedTags(prev => {
          // Get emotion-based tags for current rating
          const emotionTags = getEmotionBasedTags(rating);
          
          // Combine all suggested tags without duplicates
          return [...new Set([...emotionTags, ...result.suggested_tags])];
        });
        
        // Auto-select suggested tags
        setSelectedTags(prev => {
          // Keep existing selections and add new ones without duplication
          return [...new Set([...prev, ...result.suggested_tags])];
        });
      }
      
      // If AI provides a rating suggestion, adjust rating
      if (result.rating) {
        setRating(result.rating);
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
      // Don't show the toast for analysis failure as it's not critical
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
      // Map rating to sentiment label and score
      let sentiment_label: string;
      let sentiment_score: number;
      
      switch (rating) {
        case 5: // Motivated
          sentiment_label = "very positive";
          sentiment_score = 1.0;
          break;
        case 4: // Happy
          sentiment_label = "positive";
          sentiment_score = 0.5;
          break;
        case 3: // Neutral
          sentiment_label = "neutral";
          sentiment_score = 0.0;
          break;
        case 2: // Frustrated
          sentiment_label = "negative";
          sentiment_score = -0.5;
          break;
        case 1: // Angry
          sentiment_label = "very negative";
          sentiment_score = -1.0;
          break;
        default:
          sentiment_label = "neutral";
          sentiment_score = 0.0;
      }
      
      // Get user metadata, with safe access to optional properties
      const userData = {
        city: (authState.user as any).city as string | undefined,
        cluster: (authState.user as any).cluster as string | undefined,
        role: authState.role as string | undefined
      };
      
      const sentimentData: SentimentRating = {
        employee_id: authState.user.id,
        rating,
        feedback: feedback.trim() || undefined,
        city: userData.city,
        cluster: userData.cluster,
        role: userData.role,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sentiment_score: sentiment_score,
        sentiment_label: sentiment_label
      };
      
      console.log("Submitting sentiment data:", sentimentData);
      
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
        throw new Error(error || "Failed to submit feedback");
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
