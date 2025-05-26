
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
        console.log("Trend analytics processing", allIssues.length, "issues");
        
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

        // Enhanced response time calculation using multiple approaches
        const responseData: ResponseTimeData[] = last14Days.map(({ date, start, end }) => {
          // Get all issues created on this day
          const dayIssues = allIssues.filter(issue => {
            const createdDate = new Date(issue.createdAt);
            return createdDate >= start && createdDate <= end;
          });

          console.log(`Processing ${dayIssues.length} issues for date ${date}`);

          let responseTimes: number[] = [];

          // Method 1: Calculate from issue comments
          dayIssues.forEach(issue => {
            if (issue.comments && issue.comments.length > 0) {
              // Sort comments by creation time to get the first response
              const sortedComments = [...issue.comments].sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              
              const firstComment = sortedComments[0];
              const createdTime = new Date(issue.createdAt);
              const firstResponseTime = new Date(firstComment.createdAt);
              const responseTimeHours = differenceInHours(firstResponseTime, createdTime);
              
              console.log(`Issue ${issue.id}: Response time = ${responseTimeHours} hours`);
              
              if (responseTimeHours >= 0 && responseTimeHours <= 168) { // Max 1 week response time
                responseTimes.push(responseTimeHours);
              }
            }
          });

          // Method 2: If no comment-based data, use assignment time as response
          if (responseTimes.length === 0) {
            dayIssues.forEach(issue => {
              if (issue.assignedTo && issue.updatedAt !== issue.createdAt) {
                const createdTime = new Date(issue.createdAt);
                const assignedTime = new Date(issue.updatedAt);
                const responseTimeHours = differenceInHours(assignedTime, createdTime);
                
                if (responseTimeHours >= 0 && responseTimeHours <= 168) {
                  responseTimes.push(responseTimeHours);
                }
              }
            });
          }

          // Method 3: If still no data, use status change as response indicator
          if (responseTimes.length === 0) {
            dayIssues.forEach(issue => {
              if (issue.status !== 'open' && issue.updatedAt !== issue.createdAt) {
                const createdTime = new Date(issue.createdAt);
                const statusChangeTime = new Date(issue.updatedAt);
                const responseTimeHours = differenceInHours(statusChangeTime, createdTime);
                
                if (responseTimeHours >= 0 && responseTimeHours <= 168) {
                  responseTimes.push(responseTimeHours);
                }
              }
            });
          }

          const avgResponseTime = responseTimes.length > 0 
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;

          console.log(`Date ${date}: ${responseTimes.length} valid response times, avg = ${avgResponseTime}`);

          return {
            date,
            avgResponseTime: Math.round(avgResponseTime * 10) / 10 // Round to 1 decimal
          };
        });

        console.log("Final response time data:", responseData);

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
