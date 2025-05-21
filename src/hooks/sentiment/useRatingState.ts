
import { useState } from 'react';

export const useRatingState = () => {
  const [rating, setRating] = useState<number>(3);
  
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

  const handleRatingChange = (value: number, setSuggestedTags: React.Dispatch<React.SetStateAction<string[]>>) => {
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
  
  return {
    rating,
    setRating,
    handleRatingChange,
    getEmotionBasedTags
  };
};
