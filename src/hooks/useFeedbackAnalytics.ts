
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchFeedbackData,
  calculateFeedbackMetrics,
  fetchComparisonData,
  FeedbackFilters,
  FeedbackMetrics,
  FeedbackItem 
} from '../services/feedbackAnalyticsService';
import { format, subDays, eachDayOfInterval, parse } from 'date-fns';
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
  
  // Helper function to ensure we have data points for each day in the date range and all sentiment values are properly initialized
  const fillMissingDates = (data: any[], startDate: string, endDate: string) => {
    if (!startDate || !endDate) return data;
    
    try {
      // Create a map of existing data by date
      const dataByDate = data.reduce((acc: Record<string, any>, item) => {
        acc[item.date] = item;
        return acc;
      }, {});
      
      // Generate all dates in the range
      const start = parse(startDate, 'yyyy-MM-dd', new Date());
      const end = parse(endDate, 'yyyy-MM-dd', new Date());
      
      const allDates = eachDayOfInterval({ start, end });
      
      // Fill in missing dates with zero values, ensure all are numbers
      const filledData = allDates.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const existingData = dataByDate[dateStr];
        
        if (existingData) {
          // Ensure all sentiment properties exist and are numbers
          return {
            date: dateStr,
            happy: Number(existingData.happy || 0),
            neutral: Number(existingData.neutral || 0),
            sad: Number(existingData.sad || 0),
            total: Number(existingData.total || 0)
          };
        }
        
        // Return default structure with zeros for new date entries
        return { 
          date: dateStr, 
          happy: 0, 
          neutral: 0, 
          sad: 0, 
          total: 0 
        };
      });
      
      console.log("After filling missing dates:", filledData);
      return filledData;
    } catch (err) {
      console.error("Error filling missing dates:", err);
      return data;
    }
  };
  
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
        let currentData: FeedbackItem[] = [];
        
        if (showComparison && filters.comparisonMode && filters.comparisonMode !== 'none') {
          // Fetch both current and comparison data
          const result = await fetchComparisonData(filters);
          
          // Fill in missing dates for trend data and ensure proper number types
          if (result.current && result.current.trendData) {
            result.current.trendData = fillMissingDates(
              result.current.trendData,
              filters.startDate || '',
              filters.endDate || ''
            );
          }
          
          if (result.previous && result.previous.trendData) {
            result.previous.trendData = fillMissingDates(
              result.previous.trendData,
              // We use the same date range length for previous period
              filters.startDate || '',
              filters.endDate || ''
            );
          }
          
          setMetrics(result.current);
          setComparisonMetrics(result.previous);
          
          // Get raw data for current period only
          currentData = await fetchFeedbackData(filters);
          setRawData(currentData || []);
        } else {
          // Fetch only current data
          currentData = await fetchFeedbackData(filters);
          console.log("Fetched feedback data:", currentData?.length || 0, "items");
          setRawData(currentData || []);
          const calculatedMetrics = calculateFeedbackMetrics(currentData || []);
          
          // Fill in missing dates for trend data and ensure proper number types
          if (calculatedMetrics && calculatedMetrics.trendData) {
            calculatedMetrics.trendData = fillMissingDates(
              calculatedMetrics.trendData,
              filters.startDate || '',
              filters.endDate || ''
            );
            
            // Debug the trend data after filling
            console.log("Trend data after filling:", calculatedMetrics.trendData);
          }
          
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
