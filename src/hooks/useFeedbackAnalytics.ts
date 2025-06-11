
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FeedbackMetrics, FeedbackFilters, ComparisonMode } from '@/types';

// Mock data for feedback analytics
const mockFeedbackMetrics: FeedbackMetrics = {
  totalCount: 150,
  averageRating: 4.2,
  responseRate: 85.5,
  satisfactionScore: 78.3,
  sentimentPercentages: {
    happy: 65,
    neutral: 25,
    sad: 10,
  },
  sentimentCounts: {
    happy: 98,
    neutral: 38,
    sad: 15,
  },
  topOptions: [], // Add missing property
  trendData: [], // Add missing property
};

export const useFeedbackAnalytics = () => {
  const [filters, setFilters] = useState<FeedbackFilters>({
    startDate: undefined,
    endDate: undefined,
  });
  
  const [showComparison, setShowComparison] = useState(false);

  // Mock data fetch
  const { data: metrics = mockFeedbackMetrics, isLoading, error } = useQuery({
    queryKey: ['feedback-analytics', filters],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockFeedbackMetrics;
    },
  });

  const { data: comparisonMetrics = mockFeedbackMetrics } = useQuery({
    queryKey: ['feedback-analytics-comparison', filters],
    queryFn: async () => {
      // Simulate API call for comparison data
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        ...mockFeedbackMetrics,
        totalCount: 120,
        averageRating: 3.8,
      };
    },
    enabled: showComparison,
  });

  const updateFilters = useCallback((newFilters: Partial<FeedbackFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const toggleComparison = useCallback((enabled: boolean) => {
    setShowComparison(enabled);
  }, []);

  const handleExport = useCallback(async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      console.log(`Exporting feedback analytics as ${format}`);
      // Mock export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would call an export service
      const exportData = {
        metrics,
        filters,
        timestamp: new Date().toISOString(),
      };
      
      // For now, just log the export
      console.log('Export completed:', exportData);
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [metrics, filters]);

  return {
    metrics,
    comparisonMetrics,
    isLoading,
    error: error as Error,
    rawData: [], // Mock empty array for FeedbackItem[]
    filters,
    showComparison,
    updateFilters,
    toggleComparison,
    handleExport,
  };
};
