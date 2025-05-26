
import { useState, useEffect } from 'react';
import { IssueFilters } from '@/services/issues/issueFilters';
import { getIssues } from '@/services/issues/issueFilters';
import { subDays, format, startOfDay, endOfDay, differenceInHours } from 'date-fns';

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

        // Process ticket trend data - only using real data
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

        // Process response time data using real data from issues with comments
        const responseData: ResponseTimeData[] = last14Days.map(({ date, start, end }) => {
          const dayIssues = allIssues.filter(issue => {
            const createdDate = new Date(issue.createdAt);
            return createdDate >= start && createdDate <= end;
          });

          // Calculate actual response times from issues that have comments
          const responseTimes = dayIssues
            .filter(issue => issue.comments && issue.comments.length > 0)
            .map(issue => {
              const firstComment = issue.comments[0];
              const createdTime = new Date(issue.createdAt);
              const firstResponseTime = new Date(firstComment.createdAt);
              return differenceInHours(firstResponseTime, createdTime);
            })
            .filter(time => time >= 0); // Only positive response times

          const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

          return {
            date,
            avgResponseTime: Math.round(avgResponseTime * 10) / 10 // Round to 1 decimal
          };
        });

        setTicketTrendData(trendData);
        setResponseTimeData(responseData);
      } catch (error) {
        console.error('Error fetching trend analytics:', error);
        // Set empty arrays on error instead of mock data
        setTicketTrendData([]);
        setResponseTimeData([]);
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
