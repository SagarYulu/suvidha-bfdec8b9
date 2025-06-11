
import { useState, useEffect } from 'react';
import { ApiClient } from '@/services/apiClient';

interface TrendData {
  date: string;
  created: number;
  resolved: number;
}

interface ResponseTimeData {
  date: string;
  avgResponseTime: number;
}

export const useTrendAnalytics = (filters: any) => {
  const [ticketTrendData, setTicketTrendData] = useState<TrendData[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrendData();
  }, [filters]);

  const fetchTrendData = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for now
      const mockTicketTrend: TrendData[] = [
        { date: '2024-01-01', created: 45, resolved: 32 },
        { date: '2024-01-02', created: 52, resolved: 38 },
        { date: '2024-01-03', created: 38, resolved: 45 },
        { date: '2024-01-04', created: 63, resolved: 42 },
        { date: '2024-01-05', created: 55, resolved: 48 },
      ];

      const mockResponseTime: ResponseTimeData[] = [
        { date: '2024-01-01', avgResponseTime: 2.5 },
        { date: '2024-01-02', avgResponseTime: 2.8 },
        { date: '2024-01-03', avgResponseTime: 2.2 },
        { date: '2024-01-04', avgResponseTime: 3.1 },
        { date: '2024-01-05', avgResponseTime: 2.6 },
      ];

      setTicketTrendData(mockTicketTrend);
      setResponseTimeData(mockResponseTime);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ticketTrendData,
    responseTimeData,
    isLoading
  };
};
