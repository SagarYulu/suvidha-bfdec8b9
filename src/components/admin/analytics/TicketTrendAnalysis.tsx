
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; 
import { Button } from "@/components/ui/button";
import { Donut, ChartBar, LineChart, ChartArea } from "lucide-react";
import { 
  BarChart, Bar, LineChart as RechartsLineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area,
  RadialBarChart, RadialBar, Cell, PieChart, Pie, Label
} from 'recharts';
import { format } from 'date-fns';
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { exportChartDataToCSV } from "@/utils/csvExportUtils";

interface TicketTrendAnalysisProps {
  filters: AdvancedFilters;
}

// Define strong TypeScript interfaces for our data
interface ResolutionTimeData {
  name: string;
  time: number;
  volume: number;
}

interface StatusDistributionData {
  name: string;
  value: number;
  color: string;
  percentage?: string;
}

interface PriorityDistributionData {
  name: string;
  count: number;
}

interface FirstResponseData {
  name: string;
  time: number;
  count: number;
}

interface ReopenedTicketData {
  name: string;
  total: number;
  reopened: number;
}

interface ResolutionTimeByTypeData {
  name: string;
  value: number;
  count: number;
}

// Define accumulator interfaces for our reducers
interface IssuesByTypeAcc {
  [key: string]: { total: number; reopened: number }
}

interface ResolutionByTypeAcc {
  [key: string]: { count: number; totalResolutionTime: number }
}

// Define issue-related interfaces for better type safety
interface IssueComment {
  created_at: string;
  created_by_admin?: boolean;
}

interface Issue {
  type_id?: string;
  status?: string;
  created_at?: string;
  closed_at?: string;
  issue_comments?: IssueComment[];
  priority?: string;
  status_history?: any[];
}

// Color palette for charts
const CHART_COLORS = {
  primary: '#4F46E5',      // Indigo
  secondary: '#3B82F6',    // Blue
  tertiary: '#F97316',     // Orange
  accent: '#D946EF',       // Magenta
  neutral: '#8E9196',      // Gray
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Yellow
  danger: '#EF4444',       // Red
  info: '#0EA5E9',         // Light Blue
  background: '#E5DEFF',   // Soft Purple
  
  // Status-specific colors
  in_progress_open: '#3B82F6',  // Blue for In Progress & Open
  open: '#F59E0B',         // Yellow/Orange
  resolved_closed: '#10B981', // Green for Resolved & Closed
  unknown: '#8E9196',      // Gray
};

// Date formatter helper function
const formatChartDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'yyyy-MM-dd');
  } catch (e) {
    return dateStr;
  }
};

// More readable date format for display
const formatDisplayDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return format(date, 'MMM dd');
  } catch (e) {
    return dateStr;
  }
};

export const TicketTrendAnalysis: React.FC<TicketTrendAnalysisProps> = ({ filters }) => {
  const { data, isLoading, error } = useAdvancedAnalytics(filters);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  if (error || !data || !data.rawIssues || data.rawIssues.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No trend data available. Please adjust your filters and try again.</p>
      </div>
    );
  }

  const issues = data.rawIssues as Issue[];

  // 1. Issue Resolution Time Trend (Line Chart)
  const getResolutionTimeTrend = (): ResolutionTimeData[] => {
    const closedIssues = issues.filter(issue => 
      issue.status === 'closed' || issue.status === 'resolved'
    );

    if (closedIssues.length === 0) return [];

    // Group by week
    const weeklyData = closedIssues.reduce((acc, issue) => {
      if (!issue.created_at || !issue.closed_at) return acc;
      
      const createdDate = new Date(issue.created_at);
      const closedDate = new Date(issue.closed_at);
      const resolutionTime = (closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
      
      // Get week number (using Sunday as first day)
      const weekStart = new Date(createdDate);
      weekStart.setDate(createdDate.getDate() - createdDate.getDay());
      const weekKey = `${weekStart.toISOString().split('T')[0]}`;
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekKey,
          avgResolutionTime: 0,
          count: 0,
        };
      }
      
      acc[weekKey].avgResolutionTime += resolutionTime;
      acc[weekKey].count += 1;
      
      return acc;
    }, {} as Record<string, { week: string; avgResolutionTime: number; count: number }>);
    
    return Object.values(weeklyData)
      .map(({ week, avgResolutionTime, count }) => ({
        name: week,
        time: avgResolutionTime / count,
        volume: count
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-12); // Last 12 weeks
  };

  const resolutionTimeTrend = getResolutionTimeTrend();
  
  // 2. Ticket Volume by Status (Donut Chart) - Modified to group statuses
  const getStatusDistribution = (): StatusDistributionData[] => {
    // Status groups we want to track
    const statusGroups = {
      'In Progress & Open': ['in_progress', 'open'],
      'Resolved & Closed': ['resolved', 'closed'],
      'Open': ['open'],
      'Unknown': ['unknown']
    };

    // Initialize the counts for each group
    const groupCounts: Record<string, number> = {
      'In Progress & Open': 0,
      'Resolved & Closed': 0,
      'Open': 0, 
      'Unknown': 0
    };
    
    // Count issues by status
    issues.forEach(issue => {
      const status = issue.status || 'unknown';
      
      // Count "Open" separately
      if (status === 'open') {
        groupCounts['Open']++;
      }
      
      // Count combined groups
      if (statusGroups['In Progress & Open'].includes(status)) {
        groupCounts['In Progress & Open']++;
      } else if (statusGroups['Resolved & Closed'].includes(status)) {
        groupCounts['Resolved & Closed']++;
      } else if (status === 'unknown') {
        groupCounts['Unknown']++;
      }
    });
    
    // Calculate total for percentages
    const total = Object.values(groupCounts).reduce((sum, count) => sum + count, 0);
    
    // Create the final data structure for the chart
    return [
      {
        name: 'In Progress & Open',
        value: groupCounts['In Progress & Open'],
        color: CHART_COLORS.in_progress_open,
        percentage: `${Math.round((groupCounts['In Progress & Open'] / total) * 100)}%`
      },
      {
        name: 'Resolved & Closed',
        value: groupCounts['Resolved & Closed'],
        color: CHART_COLORS.resolved_closed,
        percentage: `${Math.round((groupCounts['Resolved & Closed'] / total) * 100)}%`
      },
      {
        name: 'Open',
        value: groupCounts['Open'],
        color: CHART_COLORS.open,
        percentage: `${Math.round((groupCounts['Open'] / total) * 100)}%`
      },
      {
        name: 'Unknown',
        value: groupCounts['Unknown'],
        color: CHART_COLORS.unknown,
        percentage: `${Math.round((groupCounts['Unknown'] / total) * 100)}%`
      },
    ].filter(item => item.value > 0); // Only include groups with non-zero counts
  };
  
  const statusDistribution = getStatusDistribution();
  
  // 3. Tickets by Priority (Vertical Bar Chart)
  const getPriorityDistribution = (): PriorityDistributionData[] => {
    const priorities = ['low', 'medium', 'high', 'critical'];
    const priorityCounts = issues.reduce((acc, issue) => {
      // Extract priority or calculate it
      let priority = issue.priority || 'medium';
      
      // Normalize priority to one of our standard values
      if (!priorities.includes(priority.toLowerCase())) {
        priority = 'medium';
      }
      
      acc[priority.toLowerCase()] = (acc[priority.toLowerCase()] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Ensure all priorities are represented
    return priorities.map(priority => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: priorityCounts[priority] || 0
    }));
  };
  
  const priorityDistribution = getPriorityDistribution();
  
  // 4. First Response Time Trends (Area Chart) - Updated styling to match image
  const getFirstResponseTrend = (): FirstResponseData[] => {
    const issuesWithComments = issues.filter(issue => 
      issue.issue_comments && issue.issue_comments.length > 0
    );
    
    if (issuesWithComments.length === 0) return [];
    
    // Get the current date and determine the start of the current week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Set to Sunday
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Group by day for current week, otherwise by month
    const timeData = issuesWithComments.reduce((acc, issue) => {
      if (!issue.created_at || !issue.issue_comments) return acc;
      
      // Sort comments and find first one
      const sortedComments = [...issue.issue_comments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      if (sortedComments.length === 0) return acc;
      
      const createdDate = new Date(issue.created_at);
      const firstResponseDate = new Date(sortedComments[0].created_at);
      const responseTime = (firstResponseDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
      
      // Determine if this issue is from the current week
      const isCurrentWeek = createdDate >= startOfWeek;
      
      let timeKey;
      if (isCurrentWeek) {
        // For current week, group by day
        timeKey = format(createdDate, 'yyyy-MM-dd');
      } else {
        // For older data, group by week
        const weekStart = new Date(createdDate);
        weekStart.setDate(createdDate.getDate() - createdDate.getDay());
        timeKey = format(weekStart, 'yyyy-MM-dd');
      }
      
      if (!acc[timeKey]) {
        acc[timeKey] = {
          timeKey,
          totalResponseTime: 0,
          count: 0,
        };
      }
      
      acc[timeKey].totalResponseTime += responseTime;
      acc[timeKey].count += 1;
      
      return acc;
    }, {} as Record<string, { timeKey: string; totalResponseTime: number; count: number }>);
    
    return Object.values(timeData)
      .map(({ timeKey, totalResponseTime, count }) => ({
        name: timeKey,
        time: totalResponseTime / count,
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(-5); // Last 5 periods for readability
  };
  
  const firstResponseTrend = getFirstResponseTrend();
  
  // 5. Reopened Tickets Analysis (Horizontal Bar Chart)
  const getReopenedTicketsTrend = (): ReopenedTicketData[] => {
    // Sample implementation - in a real app, we'd use actual reopened data
    // Assumption: tickets with multiple status changes might be reopened
    const issuesByIssueType = issues.reduce((acc: IssuesByTypeAcc, issue) => {
      const typeId = issue.type_id || 'unknown';
      if (!acc[typeId]) {
        acc[typeId] = {
          total: 0,
          reopened: 0
        };
      }
      
      acc[typeId].total += 1;
      
      // Counting reopened tickets (implementation depends on how reopening is tracked)
      // For this example, we'll use a simple heuristic: 
      // Count tickets with multiple status updates as potentially reopened
      if (issue.status_history && issue.status_history.length > 1) {
        acc[typeId].reopened += 1;
      }
      
      return acc;
    }, {} as IssuesByTypeAcc);
    
    // Convert the accumulated data into the required format
    return Object.entries(issuesByIssueType).map(([type, counts]) => ({
      name: type === 'unknown' ? 'Other' : type,
      total: counts.total,
      reopened: counts.reopened
    }));
  };
  
  const reopenedTickets = getReopenedTicketsTrend();
  
  // 6. Resolution Time by Issue Type (Bar Chart)
  const getResolutionTimeByType = (): ResolutionTimeByTypeData[] => {
    const closedIssuesByType = issues.filter(issue => 
      (issue.status === 'closed' || issue.status === 'resolved') && 
      issue.created_at && 
      issue.closed_at
    ).reduce((acc: ResolutionByTypeAcc, issue) => {
      const typeId = issue.type_id || 'unknown';
      
      if (!acc[typeId]) {
        acc[typeId] = {
          count: 0,
          totalResolutionTime: 0
        };
      }
      
      const createdDate = new Date(issue.created_at!);
      const closedDate = new Date(issue.closed_at!);
      const resolutionTime = (closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
      
      acc[typeId].count += 1;
      acc[typeId].totalResolutionTime += resolutionTime;
      
      return acc;
    }, {} as ResolutionByTypeAcc);
    
    // Convert the accumulated data into the required format
    return Object.entries(closedIssuesByType).map(([type, stats]) => ({
      name: type === 'unknown' ? 'Other' : type,
      value: stats.count > 0 ? Math.round(stats.totalResolutionTime / stats.count) : 0,
      count: stats.count
    }));
  };
  
  const resolutionTimeByType = getResolutionTimeByType();

  // Export functions
  const exportResolutionTimeData = () => {
    exportChartDataToCSV(
      resolutionTimeTrend.map(item => ({
        'Period': formatDisplayDate(item.name),
        'Average Resolution Time (hours)': item.time.toFixed(2),
        'Ticket Volume': item.volume
      })),
      "resolution-time-trend"
    );
  };

  const exportStatusDistribution = () => {
    exportChartDataToCSV(
      statusDistribution.map(item => ({
        'Status': item.name,
        'Count': item.value,
        'Percentage': item.percentage
      })),
      "ticket-status-distribution"
    );
  };

  const exportPriorityDistribution = () => {
    exportChartDataToCSV(
      priorityDistribution.map(item => ({
        'Priority': item.name,
        'Count': item.count
      })),
      "ticket-priority-distribution"
    );
  };

  const exportFirstResponseData = () => {
    exportChartDataToCSV(
      firstResponseTrend.map(item => ({
        'Period': formatDisplayDate(item.name),
        'Average Response Time (hours)': item.time.toFixed(2),
        'Ticket Count': item.count
      })),
      "first-response-time-trend"
    );
  };

  const exportReopenedTicketsData = () => {
    exportChartDataToCSV(
      reopenedTickets.map(item => ({
        'Issue Type': item.name,
        'Total Tickets': item.total,
        'Reopened Tickets': item.reopened,
        'Reopened Rate (%)': item.total > 0 ? ((item.reopened / item.total) * 100).toFixed(1) : '0'
      })),
      "reopened-tickets-analysis"
    );
  };

  const exportResolutionTimeByType = () => {
    exportChartDataToCSV(
      resolutionTimeByType.map(item => ({
        'Issue Type': item.name,
        'Average Resolution Time (hours)': item.value,
        'Ticket Count': item.count
      })),
      "resolution-time-by-type"
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ticket Trend Analysis</h2>
      </div>
      <Separator />

      {/* First row of insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Resolution Time Trend - Updated to match reference image */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-blue-500" /> Resolution Time Trend
                </CardTitle>
                <CardDescription>Average time to resolve tickets</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportResolutionTimeData}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={resolutionTimeTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="resolutionTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatDisplayDate}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ value: 'Tickets', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'time') return [`${Number(value).toFixed(1)} hours`, 'Avg. Resolution Time'];
                    return [value, 'Ticket Volume'];
                  }}
                  labelFormatter={(label) => formatDisplayDate(label as string)}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eaeaea'
                  }}
                />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="time" 
                  name="Avg. Resolution Time" 
                  stroke="#0066FF"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#0066FF' }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volume" 
                  name="Ticket Volume" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={{ r: 4, fill: '#10B981' }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Ticket Status Distribution - Modified to group statuses */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Donut className="h-5 w-5 text-purple-500" /> Status Distribution
                </CardTitle>
                <CardDescription>Current distribution of ticket statuses</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportStatusDistribution}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={true}
                  label={({ name, percent, x, y, midAngle }) => {
                    // Calculate the position for the text labels
                    const status = statusDistribution.find(s => s.name === name);
                    if (!status) return null;
                    
                    const sin = Math.sin(-midAngle * Math.PI / 180);
                    const cos = Math.cos(-midAngle * Math.PI / 180);
                    const sx = x + (cos >= 0 ? 1 : -1) * 12;
                    const sy = y;
                    const mx = sx + (cos >= 0 ? 1 : -1) * 40;
                    const my = sy;
                    
                    return (
                      <g>
                        <text 
                          x={mx} 
                          y={my} 
                          fill={status.color}
                          textAnchor={cos >= 0 ? 'start' : 'end'}
                          dominantBaseline="central"
                          fontWeight="bold"
                        >
                          {name}: {status.percentage}
                        </text>
                      </g>
                    );
                  }}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} tickets`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eaeaea'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second row of insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Priority Distribution */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-yellow-500" /> Ticket Priority
                </CardTitle>
                <CardDescription>Distribution of tickets by priority level</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportPriorityDistribution}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={priorityDistribution} 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} tickets`, 'Count']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eaeaea'
                  }}
                />
                <Legend />
                <defs>
                  {priorityDistribution.map((entry, index) => (
                    <linearGradient 
                      key={`gradient-${index}`}
                      id={`priorityGradient-${index}`} 
                      x1="0" 
                      y1="0" 
                      x2="0" 
                      y2="1"
                    >
                      <stop 
                        offset="5%" 
                        stopColor={index === 3 ? CHART_COLORS.danger : 
                                   index === 2 ? CHART_COLORS.warning :
                                   index === 1 ? CHART_COLORS.info :
                                   CHART_COLORS.success} 
                        stopOpacity={0.8}
                      />
                      <stop 
                        offset="95%" 
                        stopColor={index === 3 ? CHART_COLORS.danger : 
                                   index === 2 ? CHART_COLORS.warning :
                                   index === 1 ? CHART_COLORS.info :
                                   CHART_COLORS.success} 
                        stopOpacity={0.2}
                      />
                    </linearGradient>
                  ))}
                </defs>
                <Bar 
                  dataKey="count" 
                  name="Tickets" 
                  fill={CHART_COLORS.info}
                  barSize={60}
                  radius={[5, 5, 0, 0]}
                  label={{ position: 'top', formatter: (value) => value }}
                  // Using different colors based on priority
                  isAnimationActive={true}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`url(#priorityGradient-${index})`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. First Response Time Trend - Updated to match reference image */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold">
                  <span className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" /> First Response Time Trend
                  </span>
                </CardTitle>
                <CardDescription>Average time for first reply to tickets (weekly)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportFirstResponseData}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={firstResponseTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              >
                <defs>
                  <linearGradient id="responseTimeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="countGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatDisplayDate}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ 
                    value: 'Tickets', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ 
                    value: 'Tickets', 
                    angle: 90, 
                    position: 'insideRight', 
                    style: { textAnchor: 'middle' } 
                  }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'time') return [`${value.toFixed(1)} hours`, 'Avg. First Response'];
                    return [value.toString(), 'Ticket Volume'];
                  }}
                  labelFormatter={(value) => formatDisplayDate(value as string)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eaeaea'
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="time"
                  name="Avg. First Response"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, fill: '#3B82F6' }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="count" 
                  name="Ticket Volume" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 4, fill: '#10B981' }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Third row of insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5. Reopened Tickets Analysis */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5 text-orange-500" /> Reopened Tickets
                </CardTitle>
                <CardDescription>Comparison of total vs. reopened tickets by type</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportReopenedTicketsData}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={reopenedTickets}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.4}/>
                  </linearGradient>
                  <linearGradient id="reopenedGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="5%" stopColor={CHART_COLORS.warning} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.warning} stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontalPoints={[0]} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eaeaea'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="total" 
                  name="Total Tickets" 
                  fill="url(#totalGradient)" 
                  radius={[0, 5, 5, 0]}
                />
                <Bar 
                  dataKey="reopened" 
                  name="Reopened Tickets" 
                  fill="url(#reopenedGradient)" 
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Resolution Time by Issue Type */}
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Donut className="h-5 w-5 text-pink-500" /> Resolution Time by Type
                </CardTitle>
                <CardDescription>Average hours to resolve by issue type</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportResolutionTimeByType}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={resolutionTimeByType}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="resolutionBarGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS.accent} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={CHART_COLORS.accent} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }} />
                <Tooltip 
                  formatter={(value) => [`${value} hours`, 'Average Resolution Time']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #eaeaea'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Avg. Resolution Time" 
                  fill="url(#resolutionBarGradient)"
                  radius={[5, 5, 0, 0]}
                  barSize={40}
                  label={{ position: 'top', formatter: (value) => value }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

