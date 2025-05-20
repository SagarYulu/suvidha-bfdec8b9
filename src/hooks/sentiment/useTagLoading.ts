
import { useEffect } from 'react';
import { fetchSentimentTags, SentimentTag } from '@/services/sentimentService';

export const useTagLoading = (setTags: React.Dispatch<React.SetStateAction<SentimentTag[]>>) => {
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const loadTags = async () => {
      try {
        console.log("Attempting to load sentiment tags...");
        const sentimentTags = await fetchSentimentTags();
        
        if (!mounted) return;
        
        if (sentimentTags && sentimentTags.length > 0) {
          console.log(`Successfully loaded ${sentimentTags.length} sentiment tags:`, sentimentTags);
          setTags(sentimentTags);
        } else {
          // If we got an empty array, we should retry
          console.warn("Received empty tags array, will retry...");
          retryTag();
        }
      } catch (error) {
        console.error("Error loading sentiment tags:", error);
        retryTag();
      }
    };
    
    const retryTag = () => {
      if (retryCount < maxRetries && mounted) {
        retryCount++;
        const delay = 1000 * retryCount; // Exponential backoff
        console.log(`Retrying tag load (${retryCount}/${maxRetries}) in ${delay}ms...`);
        setTimeout(loadTags, delay);
      } else {
        // Fallback tags after all retries fail
        setFallbackTags();
      }
    };
    
    const setFallbackTags = () => {
      if (mounted) {
        console.log("Using fallback tags as loading from API failed");
        setTags([
          { id: 'fb-1', name: 'Work-Life Balance', category: 'Wellness' },
          { id: 'fb-2', name: 'Career Growth', category: 'Development' },
          { id: 'fb-3', name: 'Salary', category: 'Benefits' },
          { id: 'fb-4', name: 'Manager', category: 'Leadership' },
          { id: 'fb-5', name: 'Team', category: 'Work Environment' },
          { id: 'fb-6', name: 'Workload', category: 'Wellness' },
          { id: 'fb-7', name: 'Communication', category: 'Leadership' },
          { id: 'fb-8', name: 'Work Place', category: 'Infrastructure' },
          { id: 'fb-9', name: 'Training', category: 'Guiding' }
        ]);
      }
    };
    
    // Load tags on mount
    loadTags();
    
    return () => {
      mounted = false;
    };
  }, [setTags]);
};
