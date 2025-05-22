
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
import { useToast } from '@/components/ui/use-toast';

export const useFeedbackAnalytics = (initialFilters?: Partial<FeedbackFilters>) => {
  // Default to last 30 days if no dates provided
  const today = new Date();
  const defaultStartDate = format(subDays(today, 30), 'yyyy-MM-dd');
  const defaultEndDate = format(today, 'yyyy-MM-dd');
  
  const { toast } = useToast();
  
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
  const [dataFetched, setDataFetched] = useState(false);
  const [activeDataFetch, setActiveDataFetch] = useState(false);
  
  // Update filters when user changes selection
  const updateFilters = (newFilters: Partial<FeedbackFilters>) => {
    // Prevent race conditions by ignoring new filter requests during active fetch
    if (activeDataFetch) return;
    
    setFilters(prev => ({ ...prev, ...newFilters }));
    setDataFetched(false);
  };
  
  // Toggle comparison mode
  const toggleComparison = (enabled: boolean) => {
    // Prevent race conditions by ignoring toggle requests during active fetch
    if (activeDataFetch) return;
    
    setShowComparison(enabled);
    if (!enabled) {
      // Turn off comparison mode
      updateFilters({ comparisonMode: 'none' });
    } else {
      // Default to week on week if turning on
      updateFilters({ comparisonMode: 'wow' });
    }
    setDataFetched(false);
  };
  
  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched || activeDataFetch) return;
      
      setIsLoading(true);
      setError(null);
      setActiveDataFetch(true);
      console.log("Fetching feedback data with filters:", filters);
      
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
          console.log("Fetched feedback data:", data?.length || 0, "items");
          setRawData(data);
          const calculatedMetrics = calculateFeedbackMetrics(data);
          console.log("Calculated metrics:", calculatedMetrics);
          setMetrics(calculatedMetrics);
          setComparisonMetrics(null);
        }
        setDataFetched(true);
      } catch (err) {
        console.error('Error in useFeedbackAnalytics:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(err instanceof Error ? err : new Error(errorMessage));
        
        toast({
          title: "Error fetching feedback data",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        setActiveDataFetch(false);
      }
    };
    
    fetchData();
  }, [filters, showComparison, dataFetched, activeDataFetch, toast]);
  
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
