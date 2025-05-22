
import { useState, useEffect, useCallback } from 'react';
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
import { ComparisonMode } from '@/components/admin/sentiment/ComparisonModeDropdown';

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
  const [filterChangeCount, setFilterChangeCount] = useState(0);
  
  // Update filters when user changes selection
  const updateFilters = useCallback((newFilters: Partial<FeedbackFilters>) => {
    // Prevent race conditions by ignoring new filter requests during active fetch
    if (activeDataFetch) return;
    
    console.log("Updating filters:", newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setDataFetched(false);
    setFilterChangeCount(prev => prev + 1);
  }, [activeDataFetch]);
  
  // Toggle comparison mode
  const toggleComparison = useCallback((enabled: boolean) => {
    // Prevent race conditions by ignoring toggle requests during active fetch
    if (activeDataFetch) return;
    
    console.log("Toggling comparison mode:", enabled);
    setShowComparison(enabled);
    if (!enabled) {
      // Turn off comparison mode
      updateFilters({ comparisonMode: 'none' });
    } else {
      // Default to week on week if turning on
      updateFilters({ comparisonMode: 'wow' });
    }
    setDataFetched(false);
  }, [activeDataFetch, updateFilters]);
  
  // Fetch data when filters change
  useEffect(() => {
    const fetchData = async () => {
      if (dataFetched || activeDataFetch) return;
      
      setIsLoading(true);
      setError(null);
      setActiveDataFetch(true);
      console.log("Fetching feedback data with filters:", filters);
      
      try {
        if (showComparison && filters.comparisonMode && filters.comparisonMode !== 'none') {
          // Fetch both current and comparison data
          const result = await fetchComparisonData(filters);
          setMetrics(result.current);
          setComparisonMetrics(result.previous);
          
          // Get raw data for current period only
          const data = await fetchFeedbackData(filters);
          setRawData(data || []);
        } else {
          // Fetch only current data
          const data = await fetchFeedbackData(filters);
          console.log("Fetched feedback data:", data?.length || 0, "items");
          setRawData(data || []);
          const calculatedMetrics = calculateFeedbackMetrics(data || []);
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
        // Small delay before turning off loading indicator to prevent flickering
        setTimeout(() => {
          setIsLoading(false);
          setActiveDataFetch(false);
        }, 500);
      }
    };
    
    fetchData();
  }, [filters, showComparison, dataFetched, activeDataFetch, toast, filterChangeCount]);
  
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
