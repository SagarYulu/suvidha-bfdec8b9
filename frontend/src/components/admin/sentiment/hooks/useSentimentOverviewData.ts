
import { useState, useEffect, useMemo } from 'react';

export interface ComparisonMode {
  value: 'none' | 'previous_period' | 'previous_month' | 'previous_quarter';
  label: string;
}

interface SentimentFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: ComparisonMode;
}

export const useSentimentOverviewData = (filters: SentimentFilters) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [sentimentPieData, setSentimentPieData] = useState<any[]>([]);
  const [tagData, setTagData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [comparisonInsights, setComparisonInsights] = useState<any[]>([]);

  const showComparison = filters.comparisonMode && filters.comparisonMode.value !== 'none';
  const comparisonLabel = filters.comparisonMode?.label || 'previous';

  useEffect(() => {
    loadSentimentData();
  }, [filters]);

  const loadSentimentData = async () => {
    setIsLoading(true);
    try {
      // Simulate API calls with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSentimentData([
        { name: 'Positive', value: 65, color: '#22c55e' },
        { name: 'Neutral', value: 25, color: '#64748b' },
        { name: 'Negative', value: 10, color: '#ef4444' }
      ]);
      
      setTimeSeriesData([
        { date: '2024-01-01', rating: 4.2, previousRating: 4.0 },
        { date: '2024-01-02', rating: 4.3, previousRating: 4.1 },
        { date: '2024-01-03', rating: 4.1, previousRating: 3.9 }
      ]);
      
      setSentimentPieData([
        { name: 'Positive', value: 650 },
        { name: 'Neutral', value: 250 },
        { name: 'Negative', value: 100 }
      ]);
      
      setTagData([
        { tag: 'service', count: 120, sentiment: 'positive' },
        { tag: 'delivery', count: 95, sentiment: 'neutral' },
        { tag: 'issue', count: 45, sentiment: 'negative' }
      ]);
      
      setRadarData([
        { metric: 'Quality', current: 85, previous: 80 },
        { metric: 'Speed', current: 78, previous: 75 },
        { metric: 'Support', current: 92, previous: 88 }
      ]);

      // Load comparison data if needed
      if (showComparison) {
        setIsLoadingComparison(true);
        try {
          await new Promise(resolve => setTimeout(resolve, 500));
          setComparisonInsights([
            { metric: 'Overall Sentiment', change: 5.2, direction: 'up' },
            { metric: 'Response Rate', change: -2.1, direction: 'down' }
          ]);
        } catch (error) {
          console.error('Failed to load comparison data:', error);
        } finally {
          setIsLoadingComparison(false);
        }
      }
    } catch (error) {
      console.error('Failed to load sentiment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasPreviousPeriodData = useMemo(() => {
    if (!showComparison) return false;
    return timeSeriesData.some(item => item.previousRating !== undefined);
  }, [showComparison, timeSeriesData]);

  return {
    isLoading,
    isLoadingComparison,
    sentimentData,
    timeSeriesData,
    sentimentPieData,
    tagData,
    radarData,
    comparisonInsights,
    showComparison,
    hasPreviousPeriodData,
    comparisonLabel
  };
};
