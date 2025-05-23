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

// Colors for sentiment categories
const SENTIMENT_COLORS = {
  happy: '#4ade80',  // Green
  neutral: '#fde047', // Yellow
  sad: '#f87171'     // Red
};

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
  
  // Generate hierarchical data structure for the feedback visualization
  const generateHierarchyData = (feedbackData: FeedbackItem[]) => {
    if (!feedbackData || feedbackData.length === 0) return [];
    
    const totalCount = feedbackData.length;
    
    // Group by sentiment
    const sentimentGroups: Record<string, {
      count: number,
      subReasons: Record<string, number>
    }> = {};
    
    // First pass: count the occurrences
    feedbackData.forEach(item => {
      const sentiment = item.sentiment;
      const reason = item.feedback_option;
      
      if (!sentimentGroups[sentiment]) {
        sentimentGroups[sentiment] = {
          count: 0,
          subReasons: {}
        };
      }
      
      sentimentGroups[sentiment].count++;
      
      if (!sentimentGroups[sentiment].subReasons[reason]) {
        sentimentGroups[sentiment].subReasons[reason] = 0;
      }
      
      sentimentGroups[sentiment].subReasons[reason]++;
    });
    
    // Second pass: convert to the required format
    return Object.entries(sentimentGroups).map(([sentiment, data], sentimentIndex) => {
      // Format sub-reasons
      const subReasons = Object.entries(data.subReasons).map(([reason, count], index) => ({
        id: `${sentiment}-${reason}`,
        name: reason,
        value: count,
        sentiment: sentiment,
        percentage: (count / totalCount) * 100,
        sentimentIndex: sentimentIndex
      })).sort((a, b) => b.value - a.value); // Sort by count descending
      
      return {
        id: sentiment,
        name: sentiment.charAt(0).toUpperCase() + sentiment.slice(1),
        value: data.count,
        percentage: (data.count / totalCount) * 100,
        color: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || '#94a3b8',
        subReasons
      };
    }).sort((a, b) => b.value - a.value); // Sort by count descending
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
          
          // Generate hierarchical data for the visualization
          currentData = await fetchFeedbackData(filters);
          const hierarchyData = generateHierarchyData(currentData);
          
          // Add hierarchy data to metrics
          result.current.hierarchyData = hierarchyData;
          
          setMetrics(result.current);
          setComparisonMetrics(result.previous);
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
          
          // Generate hierarchical data for the visualization
          const hierarchyData = generateHierarchyData(currentData);
          
          // Add hierarchy data to metrics
          calculatedMetrics.hierarchyData = hierarchyData;
          
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
