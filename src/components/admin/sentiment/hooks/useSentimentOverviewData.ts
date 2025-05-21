
import { useState, useEffect } from 'react';
import { ComparisonMode } from '@/components/admin/sentiment/ComparisonModeDropdown';

export interface SentimentOverviewFilters {
  startDate?: string;
  endDate?: string;
  city?: string;
  cluster?: string;
  role?: string;
  comparisonMode?: ComparisonMode;
}

export const useSentimentOverviewData = (filters: SentimentOverviewFilters) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingComparison, setIsLoadingComparison] = useState(false);
  const [sentimentData, setSentimentData] = useState<any[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<any[]>([]);
  const [sentimentPieData, setSentimentPieData] = useState<any[]>([]);
  const [tagData, setTagData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [comparisonInsights, setComparisonInsights] = useState<any[]>([]);

  // Determine if we should show comparison data
  const showComparison = Boolean(
    filters.comparisonMode && 
    filters.comparisonMode !== 'none'
  );

  // Mock data to show that something is happening
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate data loading
    setTimeout(() => {
      // Basic placeholder data 
      setSentimentData([{ id: 1, sentiment: 'positive' }]);
      setTimeSeriesData([{ date: '2023-01-01', value: 4.2 }]);
      setSentimentPieData([
        { name: 'Positive', value: 65 },
        { name: 'Neutral', value: 25 },
        { name: 'Negative', value: 10 }
      ]);
      setTagData([
        { name: 'Support', positive: 45, negative: 10 },
        { name: 'UI/UX', positive: 35, negative: 5 }
      ]);
      setRadarData([
        { subject: 'Response Time', current: 80, previous: 60 },
        { subject: 'Helpfulness', current: 90, previous: 85 }
      ]);
      
      setIsLoading(false);
      
      // If there's a comparison mode, simulate loading comparison data
      if (showComparison) {
        setIsLoadingComparison(true);
        setTimeout(() => {
          setComparisonInsights([
            {
              label: 'Sentiment Score',
              value: '4.2/5',
              change: 5.0
            },
            {
              label: 'Positive Feedback',
              value: '65%',
              change: 8.0
            },
            {
              label: 'Negative Feedback',
              value: '10%',
              change: -3.5
            }
          ]);
          setIsLoadingComparison(false);
        }, 500);
      }
    }, 1000);
  }, [filters]);
  
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
    hasPreviousPeriodData: true,
    comparisonLabel: filters.comparisonMode || 'period'
  };
};
