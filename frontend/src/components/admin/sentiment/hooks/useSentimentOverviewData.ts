
import { useState, useEffect, useMemo } from 'react';
import { sentimentService } from '@/services/sentimentService';

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
      // Load current period data
      const [sentiment, timeSeries, pie, tags, radar] = await Promise.all([
        sentimentService.getSentimentData(filters),
        sentimentService.getTimeSeriesData(filters),
        sentimentService.getSentimentDistribution(filters),
        sentimentService.getTopicData(filters),
        sentimentService.getRadarData(filters)
      ]);

      setSentimentData(sentiment);
      setTimeSeriesData(timeSeries);
      setSentimentPieData(pie);
      setTagData(tags);
      setRadarData(radar);

      // Load comparison data if needed
      if (showComparison) {
        setIsLoadingComparison(true);
        try {
          const comparisonData = await sentimentService.getComparisonInsights(filters);
          setComparisonInsights(comparisonData);
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
