
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchAllSentiment, 
  submitSentiment, 
  getSentimentAnalytics, 
  getSentimentTrends,
  SentimentFilters 
} from '@/services/sentimentService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface SentimentTag {
  id: string;
  name: string;
  category?: string;
}

export const useSentiment = () => {
  const { authState } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [rating, setRating] = useState<number>(3);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Mock tags data for now
  const tags: SentimentTag[] = [
    { id: '1', name: 'Work Environment', category: 'Workplace' },
    { id: '2', name: 'Management', category: 'Leadership' },
    { id: '3', name: 'Salary & Benefits', category: 'Compensation' },
    { id: '4', name: 'Work-Life Balance', category: 'Wellness' },
    { id: '5', name: 'Career Growth', category: 'Development' },
  ];

  // Filters for data fetching
  const [filters, setFilters] = useState<SentimentFilters>({});

  // Data queries
  const { 
    data: sentimentData = [], 
    isLoading, 
    refetch 
  } = useQuery({
    queryKey: ['sentiment-data', filters],
    queryFn: () => fetchAllSentiment(filters)
  });

  const { 
    data: analytics, 
    isLoading: analyticsLoading 
  } = useQuery({
    queryKey: ['sentiment-analytics', filters],
    queryFn: () => getSentimentAnalytics(filters)
  });

  const { 
    data: trends, 
    isLoading: trendsLoading 
  } = useQuery({
    queryKey: ['sentiment-trends', filters],
    queryFn: () => getSentimentTrends('weekly', filters)
  });

  // Form handlers
  const handleRatingChange = useCallback((newRating: number) => {
    setRating(newRating);
  }, []);

  const handleFeedbackChange = useCallback((newFeedback: string) => {
    setFeedback(newFeedback);
  }, []);

  const handleTagToggle = useCallback((tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  }, []);

  const handleAnalyzeFeedback = useCallback(async () => {
    if (feedback.trim().length < 10) return;
    
    setIsAnalyzing(true);
    try {
      // Mock analysis - in real app this would call an AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Could suggest tags based on feedback content here
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [feedback]);

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: (data: {
      rating: number;
      feedback_text?: string;
      employee_uuid: string;
      tags?: string[];
    }) => submitSentiment(data),
    onSuccess: () => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! It helps us improve.",
      });
      
      // Reset form
      setRating(3);
      setFeedback('');
      setSelectedTags([]);
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['sentiment-data'] });
      queryClient.invalidateQueries({ queryKey: ['sentiment-analytics'] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
      console.error('Submission error:', error);
    }
  });

  const handleSubmit = useCallback(async () => {
    if (!authState.user?.id) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit feedback.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMutation.mutateAsync({
        rating,
        feedback_text: feedback.trim() || undefined,
        employee_uuid: authState.user.id,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, feedback, selectedTags, authState.user?.id, submitMutation]);

  const updateFilters = useCallback((newFilters: Partial<SentimentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  return {
    // Form state
    rating,
    feedback,
    isSubmitting,
    tags,
    selectedTags,
    suggestedTags: [],
    isAnalyzing,
    
    // Form handlers
    handleRatingChange,
    handleFeedbackChange,
    handleTagToggle,
    handleAnalyzeFeedback,
    handleSubmit,
    
    // Data
    sentimentData,
    analytics,
    trends,
    filters,
    isLoading,
    analyticsLoading,
    trendsLoading,
    
    // Data handlers
    updateFilters,
    refetch,
  };
};
