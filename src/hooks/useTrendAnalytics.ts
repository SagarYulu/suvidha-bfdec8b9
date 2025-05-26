
import { useState, useEffect } from 'react';
import { IssueFilters } from '@/services/issues/issueFilters';
import { getIssues } from '@/services/issues/issueFilters';
import { subDays, format, startOfDay, endOfDay } from 'date-fns';

interface TrendData {
  date: string;
  created: number;
  resolved: number;
}

interface ResponseTimeData {
  date: string;
  avgResponseTime: number;
}

export const useTrendAnalytics = (filters: IssueFilters) => {
  const [ticketTrendData, setTicketTrendData] = useState<TrendData[]>([]);
  const [responseTimeData, setResponseTimeData] = useState<ResponseTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendData = async () => {
      setIsLoading(true);
      try {
        // Fetch all issues with current filters
        const allIssues = await getIssues(filters);
        
        // Generate data for the last 14 days
        const last14Days = Array.from({ length: 14 }, (_, i) => {
          const date = subDays(new Date(), 13 - i);
          return {
            date: format(date, 'yyyy-MM-dd'),
            displayDate: format(date, 'MMM dd'),
            start: startOfDay(date),
            end: endOfDay(date)
          };
        });

        // Process ticket trend data
        const trendData: TrendData[] = last14Days.map(({ date, start, end }) => {
          const createdOnDay = allIssues.filter(issue => {
            const createdDate = new Date(issue.createdAt);
            return createdDate >= start && createdDate <= end;
          }).length;

          const resolvedOnDay = allIssues.filter(issue => {
            if (!issue.closedAt) return false;
            const closedDate = new Date(issue.closedAt);
            return closedDate >= start && closedDate <= end;
          }).length;

          return {
            date,
            created: createdOnDay,
            resolved: resolvedOnDay
          };
        });

        // Process response time data (mock data for now - would need audit trail data)
        const responseData: ResponseTimeData[] = last14Days.map(({ date }) => {
          // Mock response time data - replace with actual calculation from audit trail
          const baseTime = 4 + Math.random() * 6; // 4-10 hours base
          const variation = (Math.random() - 0.5) * 4; // ±2 hours variation
          return {
            date,
            avgResponseTime: Math.max(0.5, baseTime + variation)
          };
        });

        setTicketTrendData(trendData);
        setResponseTimeData(responseData);
      } catch (error) {
        console.error('Error fetching trend analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendData();
  }, [filters]);

  return {
    ticketTrendData,
    responseTimeData,
    isLoading
  };
};
