
import { useState, useEffect } from 'react';
import { 
  fetchFeedbackData,
  calculateFeedbackMetrics,
  fetchComparisonData,
  FeedbackFilters,
  FeedbackMetrics,
  FeedbackItem 
} from '../services/feedbackAnalyticsService';
import { format, subDays } from 'date-fns';

export const useFeedbackAnalytics = (initialFilters?: Partial<FeedbackFilters>) => {
  // Default to last 30 days if no dates provided
  const today = new Date();
  const defaultStartDate = format(subDays(today, 30), 'yyyy-MM-dd');
  const defaultEndDate = format(today, 'yyyy-MM-dd');
  
  const [filters, setFilters] = useState<FeedbackFilters>({
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    comparisonMode: 'none',
    ...initialFilters
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [rawData, setRawData] = useState<FeedbackItem[]>([]);
  const [metrics, setMetrics] = useState<FeedbackMetrics | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<FeedbackMetrics | null>(null);
  const [showComparison, setShowComparison] = useState<boolean>(false);
  
  // Update filters when user changes selection
  const updateFilters = (newFilters: Partial<FeedbackFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  // Toggle comparison mode
  const toggleComparison = (enabled: boolean) => {
    setShowComparison(enabled);
    if (!enabled) {
      // Turn off comparison mode
      updateFilters({ comparisonMode: 'none' });
    }
  };
  
  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (showComparison && filters.comparisonMode !== 'none') {
          // Fetch both current and comparison data
          const result = await fetchComparisonData(filters);
          setMetrics(result.current);
          setComparisonMetrics(result.previous);
          
          // Get raw data for current period only
          const data = await fetchFeedbackData(filters);
          setRawData(data);
        } else {
          // Fetch only current data
          const data = await fetchFeedbackData(filters);
          setRawData(data);
          setMetrics(calculateFeedbackMetrics(data));
          setComparisonMetrics(null);
        }
      } catch (err) {
        console.error('Error in useFeedbackAnalytics:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters, showComparison]);
  
  return {
    isLoading,
    error,
    rawData,
    metrics,
    comparisonMetrics,
    filters,
    showComparison,
    updateFilters,
    toggleComparison
  };
};
