
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator"; 
import { Button } from "@/components/ui/button";
import { Donut, ChartBar, LineChart, ChartArea } from "lucide-react";
import { 
  BarChart, Bar, LineChart as RechartsLineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area,
  RadialBarChart, RadialBar
} from 'recharts';
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

interface CommentVolumeData {
  week: string;
  userComments: number;
  adminComments: number;
}

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

  const issues = data.rawIssues;

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
  
  // 2. Ticket Volume by Status (Donut Chart)
  const getStatusDistribution = (): StatusDistributionData[] => {
    const statusCounts = issues.reduce((acc, issue) => {
      const status = issue.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    }));
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
  
  // 4. First Response Time Trends (Area Chart)
  const getFirstResponseTrend = (): FirstResponseData[] => {
    const issuesWithComments = issues.filter(issue => 
      issue.issue_comments && issue.issue_comments.length > 0
    );
    
    if (issuesWithComments.length === 0) return [];
    
    // Group by month for first response time
    const monthlyData = issuesWithComments.reduce((acc, issue) => {
      if (!issue.created_at || !issue.issue_comments) return acc;
      
      // Sort comments and find first one
      const sortedComments = [...issue.issue_comments].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      if (sortedComments.length === 0) return acc;
      
      const createdDate = new Date(issue.created_at);
      const firstResponseDate = new Date(sortedComments[0].created_at);
      const responseTime = (firstResponseDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
      
      // Get month
      const monthKey = `${createdDate.getFullYear()}-${String(createdDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          avgResponseTime: 0,
          count: 0,
        };
      }
      
      acc[monthKey].avgResponseTime += responseTime;
      acc[monthKey].count += 1;
      
      return acc;
    }, {} as Record<string, { month: string; avgResponseTime: number; count: number }>);
    
    return Object.values(monthlyData)
      .map(({ month, avgResponseTime, count }) => ({
        name: month,
        time: avgResponseTime / count,
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  };
  
  const firstResponseTrend = getFirstResponseTrend();
  
  // 5. Reopened Tickets Analysis (Horizontal Bar Chart)
  const getReopenedTicketsTrend = (): ReopenedTicketData[] => {
    // Sample implementation - in a real app, we'd use actual reopened data
    // Assumption: tickets with multiple status changes might be reopened
    const issuesByIssueType = issues.reduce((acc, issue) => {
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
    }, {} as Record<string, { total: number; reopened: number }>);
    
    // Convert the accumulated data into the required format
    return Object.entries(issuesByIssueType).map(([type, counts]) => ({
      name: type === 'unknown' ? 'Other' : type,
      total: counts.total,
      reopened: counts.reopened
    }));
  };
  
  const reopenedTickets = getReopenedTicketsTrend();
  
  // 6. Resolution Time by Issue Type (Radial Bar Chart)
  const getResolutionTimeByType = (): ResolutionTimeByTypeData[] => {
    const closedIssuesByType = issues.filter(issue => 
      (issue.status === 'closed' || issue.status === 'resolved') && 
      issue.created_at && 
      issue.closed_at
    ).reduce((acc, issue) => {
      const typeId = issue.type_id || 'unknown';
      
      if (!acc[typeId]) {
        acc[typeId] = {
          count: 0,
          totalResolutionTime: 0
        };
      }
      
      const createdDate = new Date(issue.created_at);
      const closedDate = new Date(issue.closed_at);
      const resolutionTime = (closedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
      
      acc[typeId].count += 1;
      acc[typeId].totalResolutionTime += resolutionTime;
      
      return acc;
    }, {} as Record<string, { count: number; totalResolutionTime: number }>);
    
    // Convert the accumulated data into the required format
    return Object.entries(closedIssuesByType).map(([type, stats]) => ({
      name: type === 'unknown' ? 'Other' : type,
      value: stats.count > 0 ? Math.round(stats.totalResolutionTime / stats.count) : 0,
      count: stats.count
    }));
  };
  
  const resolutionTimeByType = getResolutionTimeByType();
  
  // 7. Comment Volume Trend (Line Chart with Multiple Lines)
  const getCommentVolumeTrend = (): CommentVolumeData[] => {
    const commentsByWeek = issues.reduce((acc, issue) => {
      if (!issue.created_at || !issue.issue_comments) return acc;
      
      const createdDate = new Date(issue.created_at);
      // Get week number
      const weekStart = new Date(createdDate);
      weekStart.setDate(createdDate.getDate() - createdDate.getDay());
      const weekKey = `${weekStart.toISOString().split('T')[0]}`;
      
      if (!acc[weekKey]) {
        acc[weekKey] = {
          week: weekKey,
          userComments: 0,
          adminComments: 0
        };
      }
      
      // Count comments by type
      issue.issue_comments.forEach(comment => {
        if (comment.created_by_admin) {
          acc[weekKey].adminComments += 1;
        } else {
          acc[weekKey].userComments += 1;
        }
      });
      
      return acc;
    }, {} as Record<string, CommentVolumeData>);
    
    return Object.values(commentsByWeek)
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-10); // Last 10 weeks
  };
  
  const commentVolumeTrend = getCommentVolumeTrend();

  // Export functions
  const exportResolutionTimeData = () => {
    exportChartDataToCSV(
      resolutionTimeTrend.map(item => ({
        'Period': item.name,
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
        'Count': item.value
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
        'Month': item.name,
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

  const exportCommentVolumeTrend = () => {
    exportChartDataToCSV(
      commentVolumeTrend.map(item => ({
        'Week': item.week,
        'User Comments': item.userComments,
        'Admin Comments': item.adminComments,
        'Total Comments': item.userComments + item.adminComments
      })),
      "comment-volume-trend"
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
        {/* 1. Resolution Time Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" /> Resolution Time Trend
                </CardTitle>
                <CardDescription>Average time to resolve tickets (weekly)</CardDescription>
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
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  yAxisId="left"
                  label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  label={{ value: 'Tickets', angle: 90, position: 'insideRight' }}
                />
                <Tooltip formatter={(value, name) => {
                  if (name === 'time') return [`${Number(value).toFixed(1)} hours`, 'Avg. Resolution Time'];
                  return [value, 'Ticket Volume'];
                }} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="time" 
                  name="Avg. Resolution Time" 
                  stroke="#3B82F6" 
                  dot={false} 
                  activeDot={{ r: 5 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="volume" 
                  name="Ticket Volume" 
                  stroke="#10B981" 
                  dot={false} 
                  strokeDasharray="5 5"
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 2. Ticket Status Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Donut className="h-5 w-5" /> Status Distribution
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
              <RadialBarChart 
                innerRadius="30%" 
                outerRadius="90%" 
                data={statusDistribution.map((entry, index) => ({
                  ...entry,
                  fill: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]
                }))} 
                startAngle={0} 
                endAngle={360}
              >
                <RadialBar
                  background
                  dataKey="value"
                />
                <Legend 
                  iconSize={10} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                />
                <Tooltip 
                  formatter={(value) => [`${value} tickets`, 'Count']}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Second row of insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Priority Distribution */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5" /> Ticket Priority
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Legend />
                <Bar 
                  dataKey="count" 
                  name="Tickets" 
                  fill="#3B82F6"
                  barSize={60}
                  label={{ position: 'top', formatter: (value) => value }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 4. First Response Time Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartArea className="h-5 w-5" /> First Response Time
                </CardTitle>
                <CardDescription>Average time to first response (monthly)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportFirstResponseData}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={firstResponseTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  if (name === 'time') return [`${Number(value).toFixed(1)} hours`, 'Avg. Response Time'];
                  return [value, 'Ticket Count'];
                }} />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="time" 
                  name="Avg. Response Time" 
                  fill="#8884d8" 
                  stroke="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Third row of insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 5. Reopened Tickets Analysis */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ChartBar className="h-5 w-5" /> Reopened Tickets
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" name="Total Tickets" fill="#3B82F6" />
                <Bar dataKey="reopened" name="Reopened Tickets" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 6. Resolution Time by Issue Type */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Donut className="h-5 w-5" /> Resolution Time by Type
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
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`${value} hours`, 'Average Resolution Time']} />
                <Legend />
                <Bar 
                  dataKey="value" 
                  name="Avg. Resolution Time" 
                  fill="#8B5CF6"
                  label={{ position: 'top', formatter: (value) => value }}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Fourth row of insights */}
      <div className="grid grid-cols-1 gap-6">
        {/* 7. Comment Volume Trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" /> Comment Activity Trend
                </CardTitle>
                <CardDescription>Weekly trend of user and admin comments</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportCommentVolumeTrend}>
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={commentVolumeTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="week" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="userComments" 
                  name="User Comments" 
                  stroke="#F59E0B" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="adminComments" 
                  name="Admin Comments" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
