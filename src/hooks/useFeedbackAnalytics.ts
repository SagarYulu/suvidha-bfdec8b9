
import { useState, useEffect } from 'react';
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
  view: 'overview' | 'agent' | 'solution';
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
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<FeedbackOverview | null>(null);
  const [resolvers, setResolvers] = useState<ResolverStats[]>([]);
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
        } else if (view === 'solution') {
          // For solution view, we use 'resolution' type feedback
          // to match backend terminology
          processedFilters.feedbackType = 'resolution';
        } else if (view === 'overview') {
          // In overview, we respect the user's selected feedbackType
          // If none selected, we don't filter by type
          if (!processedFilters.feedbackType) {
            delete processedFilters.feedbackType;
          }
        }
        
        console.log("Processed filters with corrected feedback type:", processedFilters);
        
        // Always fetch overview data
        const overviewData = await getFeedbackOverview(processedFilters);
        setOverview(overviewData);
        
        // Fetch trends data
        const trendsData = await getFeedbackTrends(processedFilters);
        setTrends(trendsData);
        
        // Fetch resolver data for overview and agent views
        if (view === 'overview' || view === 'agent') {
          const resolverData = await getResolverLeaderboard(processedFilters);
          setResolvers(resolverData);
        }
        
        // Fetch category data for overview and solution views
        if (view === 'overview' || view === 'solution') {
          const categoryData = await getCategoryAnalysis(processedFilters);
          setCategories(categoryData);
        }
        
      } catch (err) {
        console.error('Error fetching feedback analytics data:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters, view]);

  return {
    isLoading,
    overview,
    resolvers,
    categories,
    trends,
    error
  };
};
