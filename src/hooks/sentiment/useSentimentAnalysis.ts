import { useState } from 'react';
import { analyzeSentiment, SentimentAnalysisResult } from '@/services/sentimentService';

export const useSentimentAnalysis = (
  feedback: string,
  setIsAnalyzing: React.Dispatch<React.SetStateAction<boolean>>,
  rating: number,
  setRating: React.Dispatch<React.SetStateAction<number>>,
  setSuggestedTags: React.Dispatch<React.SetStateAction<string[]>>,
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>,
  getEmotionBasedTags: (value: number) => string[]
) => {
  const [analysisResult, setAnalysisResult] = useState<SentimentAnalysisResult | null>(null);
  
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
      
      return result;
    } catch (error) {
      console.error("Error analyzing feedback:", error);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return {
    analysisResult,
    setAnalysisResult,
    handleAnalyzeFeedback
  };
};
