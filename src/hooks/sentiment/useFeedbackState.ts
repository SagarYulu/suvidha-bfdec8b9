
import { useState } from 'react';

export const useFeedbackState = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleFeedbackChange = (
    value: string,
    analysisResult: any | null,
    setSuggestedTags: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFeedback(value);
    
    // Reset analysis if feedback is cleared
    if (!value.trim()) {
      // If analysisResult is passed in correctly, reset it using null
      if (analysisResult !== undefined) {
        analysisResult = null;
      }
      setSuggestedTags([]);
    }
  };
  
  return {
    feedback,
    setFeedback,
    isAnalyzing,
    setIsAnalyzing,
    handleFeedbackChange
  };
};
