
import { useState } from 'react';
import { SentimentTag } from '@/services/sentimentService';

export const useTagState = () => {
  const [tags, setTags] = useState<SentimentTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  const handleTagToggle = (tag: string) => {
    console.log("Toggling tag:", tag);
    
    setSelectedTags(prevTags => {
      const isSelected = prevTags.includes(tag);
      
      if (isSelected) {
        // Remove tag
        return prevTags.filter(t => t !== tag);
      } else {
        // Add tag
        return [...prevTags, tag];
      }
    });
  };
  
  return {
    tags,
    setTags,
    selectedTags,
    setSelectedTags,
    suggestedTags,
    setSuggestedTags,
    handleTagToggle
  };
};
