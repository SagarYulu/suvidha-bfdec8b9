
import { useState, useEffect, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { 
  FeedbackFilters, 
  FeedbackOverview, 
  ResolverStats, 
  CategoryStats,
  TrendPoint,
  getFeedbackOverview,
  getResolverLeaderboard,
  getCategoryAnalysis,
  getFeedbackTrends
} from '@/services/feedbackAnalyticsService';

interface UseFeedbackAnalyticsProps {
  filters: FeedbackFilters;
  view: 'overview' | 'agent' | 'resolution';
}

interface UseFeedbackAnalyticsResult {
  isLoading: boolean;
  overview: FeedbackOverview | null;
  resolvers: ResolverStats[];
  categories: CategoryStats[];
  trends: TrendPoint[];
  error: Error | null;
}

export const useFeedbackAnalytics = ({ 
  filters, 
  view 
}: UseFeedbackAnalyticsProps): UseFeedbackAnalyticsResult => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<FeedbackOverview | null>(null);
  const [resolvers, setResolvers] = useState<ResolverStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [error, setError] = useState<Error | null>(null);
  
  // Use a ref to track if we've already shown an error toast
  // This prevents multiple error toasts from stacking
  const errorToastShown = useRef(false);

  // Use a ref to track if there's a fetch in progress
  // This prevents redundant API calls
  const isFetchingRef = useRef(false);

  // Keep track of the last filter set to avoid duplicate calls
  const lastFiltersRef = useRef<string>("");
  const lastViewRef = useRef<string>("");

  // Add a request counter to limit requests in case of errors
  const requestCountRef = useRef<number>(0);
  const MAX_REQUESTS = 3; // Maximum number of consecutive requests to attempt
  
  // Add a flag to use mock data after failed attempts
  const useMockDataRef = useRef<boolean>(false);

  useEffect(() => {
    // Reset the request counter when filters or view change
    requestCountRef.current = 0;
    
    // Create a string representation of the current filters for comparison
    const filtersString = JSON.stringify(filters) + view;
    
    // If we're getting the same filters and view as before, don't refetch
    if (filtersString === lastFiltersRef.current && lastViewRef.current === view && overview !== null) {
      console.log("Skipping duplicate fetch with identical filters and view");
      return;
    }
    
    // Reset error toast flag when filters or view change
    errorToastShown.current = false;
    lastFiltersRef.current = filtersString;
    lastViewRef.current = view;
    
    const fetchData = async () => {
      // Don't start a new fetch if one is already in progress
      if (isFetchingRef.current) {
        console.log("Fetch already in progress, skipping");
        return;
      }
      
      // Check if we've exceeded the maximum request attempts
      if (requestCountRef.current >= MAX_REQUESTS && !useMockDataRef.current) {
        console.log(`Exceeded maximum request attempts (${MAX_REQUESTS}), using mock data`);
        useMockDataRef.current = true;
        
        if (!errorToastShown.current) {
          toast({
            title: "Using Demo Data",
            description: "Unable to connect to the API server. Showing demo data instead.",
            variant: "default",
          });
          errorToastShown.current = true;
        }
      }
      
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("Fetching feedback data with filters:", filters, "and view:", view);
        
        // Process dateRange into startDate and endDate if it exists
        const processedFilters = { ...filters };
        if (filters.dateRange) {
          processedFilters.startDate = filters.dateRange.start;
          processedFilters.endDate = filters.dateRange.end;
        }
        
        // IMPORTANT: Set the correct feedbackType based on the view
        // This ensures data consistency between what's displayed and what's queried
        if (view === 'agent') {
          // For agent view, we always use 'agent' type feedback
          processedFilters.feedbackType = 'agent';
        } else if (view === 'resolution') {
          // For resolution view, we use 'resolution' type feedback
          processedFilters.feedbackType = 'resolution';
        } else if (view === 'overview') {
          // In overview, respect the user's selected feedbackType
          // If none selected, we default to 'both'
          if (!processedFilters.feedbackType) {
            processedFilters.feedbackType = 'both';
          }
        }
        
        console.log("Processed filters with corrected feedback type:", processedFilters);
        requestCountRef.current += 1;
        
        // Always fetch overview data
        const overviewData = await getFeedbackOverview(processedFilters, useMockDataRef.current);
        setOverview(overviewData);
        
        // Fetch trends data
        const trendsData = await getFeedbackTrends(processedFilters, useMockDataRef.current);
        setTrends(trendsData);
        
        // Fetch resolver data for overview and agent views
        if (view === 'overview' || view === 'agent') {
          const resolverData = await getResolverLeaderboard(processedFilters, useMockDataRef.current);
          setResolvers(resolverData);
        } else {
          setResolvers([]);
        }
        
        // Fetch category data for overview and resolution views
        if (view === 'overview' || view === 'resolution') {
          const categoryData = await getCategoryAnalysis(processedFilters, useMockDataRef.current);
          setCategories(categoryData);
        } else {
          setCategories([]);
        }
        
        // Reset the request counter on successful fetch
        requestCountRef.current = 0;
        
      } catch (err) {
        console.error('Error fetching feedback analytics data:', err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        setError(err instanceof Error ? err : new Error(errorMessage));
        
        // Only show toast once per filter/view change
        if (!errorToastShown.current) {
          toast({
            title: "Data Loading Error",
            description: errorMessage,
            variant: "destructive",
          });
          errorToastShown.current = true;
        }
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };
    
    fetchData();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isFetchingRef.current = false;
    };
  }, [filters, view, toast, overview]);

  return {
    isLoading,
    overview,
    resolvers,
    categories,
    trends,
    error
  };
};
