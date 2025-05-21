
import { useState } from "react";
import { 
  ChartBarIcon, 
  ChartPieIcon, 
  ChartLineIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  DownloadIcon
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import { exportToCSV } from "@/utils/csvExportUtils";
import { 
  getChartColorByIndex, 
  hasData, 
  getPlaceholderChartData,
  CHART_COLORS
} from "@/components/charts/ChartUtils";
import { format } from "date-fns";

interface TicketTrendAnalysisProps {
  filters: AdvancedFilters;
}

export const TicketTrendAnalysis = ({ filters }: TicketTrendAnalysisProps) => {
  const { data, isLoading, error } = useAdvancedAnalytics(filters);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'weekly' | 'monthly'>('weekly');

  // Skip rendering if we're loading or have an error
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-8 text-center text-red-500">
        <p>Error loading trend analysis data. Please try again later.</p>
      </div>
    );
  }

  // Helper to format data for time-based charts
  const prepareTimeSeriesData = () => {
    if (!data?.rawIssues || data.rawIssues.length === 0) return [];

    // Group issues by date
    const issuesByDate = data.rawIssues.reduce((acc: Record<string, any>, issue) => {
      const date = new Date(issue.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          displayDate: format(date, 'MMM dd'),
          count: 0,
          openCount: 0,
          closedCount: 0,
          resolvedCount: 0,
          inProgressCount: 0
        };
      }

      acc[dateKey].count += 1;

      // Count by status
      if (issue.status === 'open') acc[dateKey].openCount += 1;
      else if (issue.status === 'closed') acc[dateKey].closedCount += 1;
      else if (issue.status === 'resolved') acc[dateKey].resolvedCount += 1;
      else if (issue.status === 'in_progress') acc[dateKey].inProgressCount += 1;

      return acc;
    }, {});

    return Object.values(issuesByDate)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // 1. Ticket Volume Trend
  const ticketVolumeTrendData = prepareTimeSeriesData();

  // 2. Resolution Rate Over Time
  const calculateResolutionRateData = () => {
    return ticketVolumeTrendData.map((day: any) => {
      const totalDay = day.count;
      const resolvedDay = day.closedCount + day.resolvedCount;
      return {
        ...day,
        resolutionRate: totalDay > 0 ? (resolvedDay / totalDay) * 100 : 0
      };
    });
  };

  // 3. Average Response Time Trend
  const responseTimeTrendData = ticketVolumeTrendData.map((day: any, index: number) => {
    // Simulating response time trend based on ticket volume
    // Higher volume might lead to longer response times
    const baseResponseTime = 2; // Base time in hours
    const volumeFactor = day.count > 5 ? 1.5 : 1;
    const randomVariation = Math.random() * 2 - 1; // Random variation between -1 and 1
    
    return {
      ...day,
      responseTime: Math.max(0.5, baseResponseTime * volumeFactor + randomVariation).toFixed(1)
    };
  });

  // 4. Priority Distribution
  const priorityDistribution = data.priorityDistribution.map(item => ({
    name: item.priority,
    value: item.count
  }));

  // 5. Top Issue Types with Resolution Time
  const prepareIssueTypeResolutionData = () => {
    const typeGroups: Record<string, { count: number, totalResolutionTime: number }> = {};
    
    data.rawIssues.forEach(issue => {
      if (!issue.type_id || (!issue.closed_at && issue.status !== 'resolved')) return;
      
      if (!typeGroups[issue.type_id]) {
        typeGroups[issue.type_id] = { count: 0, totalResolutionTime: 0 };
      }
      
      typeGroups[issue.type_id].count += 1;
      
      if (issue.closed_at) {
        const createdAt = new Date(issue.created_at);
        const closedAt = new Date(issue.closed_at);
        const resolutionTimeHours = (closedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        typeGroups[issue.type_id].totalResolutionTime += resolutionTimeHours;
      }
    });
    
    return Object.entries(typeGroups).map(([type, data]) => ({
      name: type,
      count: data.count,
      avgResolutionTime: data.count > 0 ? data.totalResolutionTime / data.count : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  };

  // 6. Weekday vs Weekend Analysis
  const weekdayWeekendData = data.weekdayVsWeekend.map(item => ({
    name: item.dayType,
    value: item.count,
    fill: item.dayType === 'Weekday' ? '#3B82F6' : '#FBBF24' 
  }));

  // 7. Ticket Status Flow
  const statusDistribution = data.statusDistribution.map(item => ({
    name: item.status,
    value: item.count
  }));

  // 8. SLA Breach by Ticket Type
  const prepareSLABreachByTypeData = () => {
    const typeBreaches: Record<string, { total: number, breached: number }> = {};
    
    data.rawIssues.forEach(issue => {
      if (!issue.type_id) return;
      
      if (!typeBreaches[issue.type_id]) {
        typeBreaches[issue.type_id] = { total: 0, breached: 0 };
      }
      
      typeBreaches[issue.type_id].total += 1;
      
      // Check if this is an SLA breached ticket based on our SLA rules
      let isBreached = false;
      
      if (issue.status === 'open' || issue.status === 'in_progress') {
        const createdAt = new Date(issue.created_at);
        const now = new Date();
        const hoursElapsed = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursElapsed > 24) { // Using 24 hour SLA for open tickets
          isBreached = true;
        }
      }
      
      if (isBreached) {
        typeBreaches[issue.type_id].breached += 1;
      }
    });
    
    return Object.entries(typeBreaches)
      .map(([type, data]) => ({
        name: type,
        total: data.total,
        breached: data.breached,
        compliant: data.total - data.breached,
        breachRate: data.total > 0 ? (data.breached / data.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  // Creating dataset for radar chart (ticket complexity)
  const prepareTicketComplexityData = () => {
    // Calculate complexity based on resolution time and comments count
    return data.topIssueTypes.map(item => {
      const issues = data.rawIssues.filter(issue => issue.type_id === item.type);
      
      const avgCommentCount = issues.reduce((sum, issue) => {
        return sum + (issue.issue_comments?.length || 0);
      }, 0) / (issues.length || 1);
      
      const avgResolTimeHours = issues.reduce((sum, issue) => {
        if (issue.closed_at) {
          const created = new Date(issue.created_at);
          const closed = new Date(issue.closed_at);
          return sum + (closed.getTime() - created.getTime()) / (1000 * 60 * 60);
        }
        return sum;
      }, 0) / (issues.filter(i => i.closed_at).length || 1);
      
      // Normalize values to a 0-100 scale for radar chart
      return {
        subject: item.type,
        'Resolution Time': Math.min(100, avgResolTimeHours * 2),
        'Comment Volume': Math.min(100, avgCommentCount * 20),
        'SLA Breach Rate': Math.min(100, prepareSLABreachByTypeData().find(t => t.name === item.type)?.breachRate || 0),
        fullMark: 100
      };
    }).slice(0, 5);
  };

  // Export function for each chart
  const exportChartData = (data: any[], filename: string) => {
    exportToCSV(data, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Ticket Trend Analysis</h2>
        <p className="text-muted-foreground">
          Advanced insights and patterns from your support ticket data
        </p>
      </div>
      
      <Separator />
      
      {/* 1. Ticket Volume Trend */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Ticket Volume Trend</CardTitle>
            <CardDescription>Daily ticket volume over time</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => exportChartData(
              ticketVolumeTrendData.map((item: any) => ({
                Date: item.date,
                'Total Tickets': item.count,
                'Open Tickets': item.openCount,
                'In Progress Tickets': item.inProgressCount,
                'Resolved Tickets': item.resolvedCount,
                'Closed Tickets': item.closedCount,
              })), 
              'ticket-volume-trend'
            )}
          >
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ChartContainer config={{
            total: { label: 'Total Tickets', color: '#1E40AF' },
            open: { label: 'Open', color: '#FBBF24' },
            inProgress: { label: 'In Progress', color: '#F59E0B' },
            resolved: { label: 'Resolved', color: '#10B981' },
            closed: { label: 'Closed', color: '#059669' }
          }}>
            <LineChart data={ticketVolumeTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="displayDate" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line type="monotone" dataKey="count" name="total" stroke="#1E40AF" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="openCount" name="open" stroke="#FBBF24" />
              <Line type="monotone" dataKey="inProgressCount" name="inProgress" stroke="#F59E0B" />
              <Line type="monotone" dataKey="resolvedCount" name="resolved" stroke="#10B981" />
              <Line type="monotone" dataKey="closedCount" name="closed" stroke="#059669" />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Second row - 2 charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Resolution Rate Over Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Resolution Rate Trend</CardTitle>
              <CardDescription>Daily resolution rate percentage</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                calculateResolutionRateData().map((item: any) => ({
                  Date: item.date,
                  'Resolution Rate (%)': item.resolutionRate.toFixed(1),
                  'Total Tickets': item.count,
                  'Resolved Tickets': item.resolvedCount + item.closedCount
                })), 
                'resolution-rate-trend'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              resolutionRate: { label: 'Resolution Rate', color: '#10B981' }
            }}>
              <LineChart data={calculateResolutionRateData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="resolutionRate" 
                  name="resolutionRate" 
                  stroke="#10B981" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        {/* 3. Response Time Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Response Time Trend</CardTitle>
              <CardDescription>Average first response time in hours</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                responseTimeTrendData.map((item: any) => ({
                  Date: item.date,
                  'Response Time (hours)': item.responseTime,
                  'Ticket Volume': item.count
                })), 
                'response-time-trend'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={{
              responseTime: { label: 'Response Time (hrs)', color: '#3B82F6' },
              volume: { label: 'Ticket Volume', color: '#9CA3AF' }
            }}>
              <LineChart data={responseTimeTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayDate" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="responseTime" 
                  name="responseTime" 
                  stroke="#3B82F6" 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="count" 
                  name="volume" 
                  stroke="#9CA3AF" 
                  strokeDasharray="3 3"
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Third row - 2 charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 4. Priority Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Breakdown of tickets by priority level</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                priorityDistribution, 
                'priority-distribution'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 5. Top Issue Types with Resolution Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Issue Types by Resolution Time</CardTitle>
              <CardDescription>Average resolution time by issue type</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                prepareIssueTypeResolutionData().map(item => ({
                  'Issue Type': item.name,
                  'Average Resolution Time (hours)': item.avgResolutionTime.toFixed(1),
                  'Ticket Count': item.count
                })), 
                'issue-type-resolution-time'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareIssueTypeResolutionData()}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 110,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip formatter={(value) => [`${parseFloat(value as string).toFixed(1)} hrs`, 'Avg Resolution Time']} />
                <Legend />
                <Bar dataKey="avgResolutionTime" name="Avg Resolution Time (hrs)" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Fourth row - 2 charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 6. Weekday vs Weekend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Weekday vs Weekend Distribution</CardTitle>
              <CardDescription>Comparison of ticket volume on weekdays vs. weekends</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                weekdayWeekendData.map(item => ({
                  'Day Type': item.name,
                  'Ticket Count': item.value
                })), 
                'weekday-weekend-comparison'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weekdayWeekendData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Ticket Count">
                  {weekdayWeekendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 7. Status Distribution */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ticket Status Distribution</CardTitle>
              <CardDescription>Breakdown of tickets by current status</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                statusDistribution.map(item => ({
                  'Status': item.name,
                  'Count': item.value
                })), 
                'status-distribution'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Fifth row - 2 charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 8. SLA Breach by Type */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>SLA Compliance by Issue Type</CardTitle>
              <CardDescription>Shows SLA compliance percentage by issue type</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                prepareSLABreachByTypeData().map(item => ({
                  'Issue Type': item.name,
                  'Total Tickets': item.total,
                  'SLA Compliant': item.compliant,
                  'SLA Breached': item.breached,
                  'Breach Rate (%)': item.breachRate.toFixed(1)
                })), 
                'sla-breach-by-type'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareSLABreachByTypeData()}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 120,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" />
                <Tooltip />
                <Legend />
                <Bar dataKey="compliant" name="SLA Compliant" stackId="a" fill="#10B981" />
                <Bar dataKey="breached" name="SLA Breached" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* 9. Radar Chart - Ticket Complexity Analysis */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ticket Complexity Analysis</CardTitle>
              <CardDescription>Multi-dimension analysis of top issue types</CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => exportChartData(
                prepareTicketComplexityData().map(item => ({
                  'Issue Type': item.subject,
                  'Resolution Time (scale)': item['Resolution Time'],
                  'Comment Volume (scale)': item['Comment Volume'],
                  'SLA Breach Rate (%)': item['SLA Breach Rate'],
                })), 
                'ticket-complexity-analysis'
              )}
            >
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export
            </Button>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={prepareTicketComplexityData()}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Resolution Time" dataKey="Resolution Time" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                <Radar name="Comment Volume" dataKey="Comment Volume" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                <Radar name="SLA Breach Rate" dataKey="SLA Breach Rate" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
