
import { IssueFilters } from "./issueFilters";
import { getIssues } from "./issueFilters";
import { Issue } from "@/types";
import { DateRange } from "react-day-picker";
import { calculateWorkingHours } from "@/utils/workingTimeUtils";

// Define the time filter interface that matches the one in useDashboardData.tsx
interface TimeFilter {
  type: 'all' | 'custom' | 'week' | 'month' | 'quarter';
  dateRange: DateRange;
  selectedWeeks: string[];
  selectedMonths: string[];
  selectedQuarters: string[];
}

// Structure for trend data points
interface TrendDataPoint {
  name: string;
  time: number; // Resolution time in hours
  volume: number; // Number of issues
  isOutlier?: boolean;
  date?: Date; // Add date for filtering
}

export const getAnalytics = async (filters: IssueFilters = {}) => {
  console.log("Getting analytics with filters:", filters);

  const allIssues = await getIssues(filters);

  const typeCounts = allIssues.reduce((acc: { [key: string]: number }, issue: Issue) => {
    const type = issue.typeId || 'Unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const cityCounts = allIssues.reduce((acc: { [key: string]: number }, issue: Issue) => {
    // Use the employee city information if available
    // This might need adjustment based on your data model
    const city = 'Unknown'; // Placeholder for now
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  // Calculate average resolution time
  let totalResolutionTime = 0;
  let validIssueCount = 0;

  for (const issue of allIssues) {
    if (issue.createdAt && issue.closedAt) {
      const createdAt = new Date(issue.createdAt);
      const closedAt = new Date(issue.closedAt);
      const resolutionTime = calculateWorkingHours(createdAt, closedAt);

      totalResolutionTime += resolutionTime;
      validIssueCount++;
    }
  }

  const averageResolutionTime = validIssueCount > 0 ? totalResolutionTime / validIssueCount : 0;

  // Mock resolution time history data
  const resolutionTimeHistory = generateResolutionTimeHistory();

  return {
    totalIssues: allIssues.length,
    openIssues: allIssues.filter(issue => issue.status === 'open').length,
    closedIssues: allIssues.filter(issue => issue.status === 'closed').length,
    averageResolutionTime: averageResolutionTime,
    typeCounts: typeCounts,
    cityCounts: cityCounts,
    resolutionTimeHistory: resolutionTimeHistory,
    resolutionRate: calculateResolutionRate(allIssues),
    avgResolutionTime: Math.round(averageResolutionTime),
    avgFirstResponseTime: 2.3, // Mock data for now
  };
};

// Calculate resolution rate
function calculateResolutionRate(issues: Issue[]): number {
  if (issues.length === 0) return 0;
  const closedIssues = issues.filter(issue => issue.status === 'closed').length;
  return (closedIssues / issues.length) * 100;
}

// Mock function to generate resolution time history data
function generateResolutionTimeHistory() {
  const history = [];
  const currentDate = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() - i);

    // Generate random resolution time between 24 and 72 hours
    const resolutionTime = Math.floor(Math.random() * (72 - 24 + 1)) + 24;

    history.push({
      name: date.toISOString().split('T')[0],
      time: resolutionTime,
    });
  }

  return history;
}

// Get resolution time trends - now accepting DateRange from react-day-picker
export const getResolutionTimeTrends = async (filters: IssueFilters, timeFilter: TimeFilter) => {
  console.log("Getting resolution time trends with filters:", filters);
  console.log("And time filter:", timeFilter);

  // Fetch all issues (will apply filters)
  const allIssues = await getIssues(filters);

  // Filter to only resolved issues (those with a closed_at date)
  const resolvedIssues = allIssues.filter(issue => issue.status === 'closed' && issue.closedAt);
  console.log(`Found ${resolvedIssues.length} resolved issues for analysis`);

  // Generate mock data for the trends
  const trendData = {
    daily: generateDailyTrends(resolvedIssues, timeFilter),
    weekly: generateWeeklyTrends(resolvedIssues, timeFilter),
    monthly: generateMonthlyTrends(resolvedIssues, timeFilter),
    quarterly: generateQuarterlyTrends(resolvedIssues, timeFilter),
  };

  return trendData;
};

// Helper functions for generating trend data
function generateDailyTrends(issues: Issue[], timeFilter: TimeFilter): TrendDataPoint[] {
  // Mock daily data - in a real app, you'd calculate this from the issues
  const dailyTrends: TrendDataPoint[] = [];
  
  // Last 30 days
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Filter issues for this day
    const dayIssues = issues.filter(issue => {
      const closedDate = new Date(issue.closedAt as string);
      return closedDate.toDateString() === date.toDateString();
    });
    
    // Calculate average resolution time
    let avgTime = 0;
    if (dayIssues.length > 0) {
      const totalTime = dayIssues.reduce((sum, issue) => {
        const createdAt = new Date(issue.createdAt);
        const closedAt = new Date(issue.closedAt as string);
        return sum + calculateWorkingHours(createdAt, closedAt);
      }, 0);
      avgTime = totalTime / dayIssues.length;
    } else {
      // Random data for demonstration
      avgTime = Math.random() * 70 + 10;
    }
    
    dailyTrends.push({
      name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: Number(avgTime.toFixed(2)),
      volume: dayIssues.length || Math.floor(Math.random() * 10 + 1),
      isOutlier: avgTime > 72,
      date: date
    });
  }
  
  return dailyTrends;
}

function generateWeeklyTrends(issues: Issue[], timeFilter: TimeFilter): TrendDataPoint[] {
  // Mock weekly data
  const weeklyTrends: TrendDataPoint[] = [];
  
  // Last 12 weeks
  for (let i = 12; i >= 0; i--) {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - (i * 7));
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6);
    
    // Filter issues for this week
    const weekIssues = issues.filter(issue => {
      const closedDate = new Date(issue.closedAt as string);
      return closedDate >= startDate && closedDate <= endDate;
    });
    
    // Calculate average resolution time
    let avgTime = 0;
    if (weekIssues.length > 0) {
      const totalTime = weekIssues.reduce((sum, issue) => {
        const createdAt = new Date(issue.createdAt);
        const closedAt = new Date(issue.closedAt as string);
        return sum + calculateWorkingHours(createdAt, closedAt);
      }, 0);
      avgTime = totalTime / weekIssues.length;
    } else {
      // Random data for demonstration
      avgTime = Math.random() * 60 + 15;
    }
    
    weeklyTrends.push({
      name: `Week ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      time: Number(avgTime.toFixed(2)),
      volume: weekIssues.length || Math.floor(Math.random() * 25 + 5),
      isOutlier: avgTime > 72,
      date: endDate
    });
  }
  
  return weeklyTrends;
}

function generateMonthlyTrends(issues: Issue[], timeFilter: TimeFilter): TrendDataPoint[] {
  // Mock monthly data
  const monthlyTrends: TrendDataPoint[] = [];
  
  // Last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    
    // Filter issues for this month
    const monthIssues = issues.filter(issue => {
      const closedDate = new Date(issue.closedAt as string);
      return closedDate.getMonth() === date.getMonth() && 
             closedDate.getFullYear() === date.getFullYear();
    });
    
    // Calculate average resolution time
    let avgTime = 0;
    if (monthIssues.length > 0) {
      const totalTime = monthIssues.reduce((sum, issue) => {
        const createdAt = new Date(issue.createdAt);
        const closedAt = new Date(issue.closedAt as string);
        return sum + calculateWorkingHours(createdAt, closedAt);
      }, 0);
      avgTime = totalTime / monthIssues.length;
    } else {
      // Random data for demonstration
      avgTime = Math.random() * 50 + 20;
    }
    
    monthlyTrends.push({
      name: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      time: Number(avgTime.toFixed(2)),
      volume: monthIssues.length || Math.floor(Math.random() * 50 + 20),
      isOutlier: avgTime > 72,
      date: date
    });
  }
  
  return monthlyTrends;
}

function generateQuarterlyTrends(issues: Issue[], timeFilter: TimeFilter): TrendDataPoint[] {
  // Mock quarterly data
  const quarterlyTrends: TrendDataPoint[] = [];
  
  // Current quarter and previous 7 quarters
  const currentDate = new Date();
  const currentQuarter = Math.floor(currentDate.getMonth() / 3) + 1;
  const currentYear = currentDate.getFullYear();
  
  for (let i = 7; i >= 0; i--) {
    let quarter = currentQuarter - (i % 4);
    let year = currentYear - Math.floor(i / 4);
    
    if (quarter <= 0) {
      quarter += 4;
      year -= 1;
    }
    
    // Start and end months for the quarter
    const startMonth = (quarter - 1) * 3;
    const endMonth = startMonth + 2;
    
    // Start and end dates for the quarter
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, endMonth + 1, 0);
    
    // Filter issues for this quarter
    const quarterIssues = issues.filter(issue => {
      const closedDate = new Date(issue.closedAt as string);
      return closedDate >= startDate && closedDate <= endDate;
    });
    
    // Calculate average resolution time
    let avgTime = 0;
    if (quarterIssues.length > 0) {
      const totalTime = quarterIssues.reduce((sum, issue) => {
        const createdAt = new Date(issue.createdAt);
        const closedAt = new Date(issue.closedAt as string);
        return sum + calculateWorkingHours(createdAt, closedAt);
      }, 0);
      avgTime = totalTime / quarterIssues.length;
    } else {
      // Random data for demonstration
      avgTime = Math.random() * 45 + 25;
    }
    
    quarterlyTrends.push({
      name: `Q${quarter} ${year}`,
      time: Number(avgTime.toFixed(2)),
      volume: quarterIssues.length || Math.floor(Math.random() * 120 + 60),
      isOutlier: avgTime > 72,
      date: endDate
    });
  }
  
  return quarterlyTrends;
}
