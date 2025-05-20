
import { useState } from 'react';

export const useFeedbackState = () => {
  const [feedback, setFeedback] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const handleFeedbackChange = (
    value: string,
    setAnalysisResult: React.Dispatch<React.SetStateAction<any | null>>,
    setSuggestedTags: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setFeedback(value);
    
    // Reset analysis if feedback is cleared
    if (!value.trim()) {
      setAnalysisResult(null);
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
