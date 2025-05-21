
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Pie, PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import {
  TrendAnalyticsData,
  PriorityDistribution,
  StatusDistribution,
  TicketTrendPoint,
  ResolutionTimeByType
} from "@/services/issues/ticketTrendService";
import { Download } from "lucide-react";
import { exportToCSV } from "@/utils/csvExportUtils";

interface TicketTrendChartsProps {
  data: TrendAnalyticsData;
  isLoading: boolean;
}

const TicketTrendCharts: React.FC<TicketTrendChartsProps> = ({ data, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'raised' | 'closed'>('raised');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Priority distribution chart data preparation
  const priorityData = [
    { name: 'Low', value: data.priorityDistribution.low },
    { name: 'Medium', value: data.priorityDistribution.medium },
    { name: 'High', value: data.priorityDistribution.high },
    { name: 'Critical', value: data.priorityDistribution.critical }
  ];

  const priorityColors = ["#4ade80", "#facc15", "#f97316", "#ef4444"];

  // Status distribution chart data preparation
  const statusData = [
    { name: 'Open', value: data.statusDistribution.open },
    { name: 'In Progress', value: data.statusDistribution.in_progress },
    { name: 'Resolved', value: data.statusDistribution.resolved },
    { name: 'Closed', value: data.statusDistribution.closed }
  ];

  const statusColors = ["#3b82f6", "#8b5cf6", "#14b8a6", "#22c55e"];

  // Trend chart data
  const trendChartData = data.ticketTrends.map(point => ({
    date: point.date,
    raised: point.raised,
    closed: point.closed,
    comparisonRaised: point.comparisonRaised || 0,
    comparisonClosed: point.comparisonClosed || 0
  }));

  // Resolution time by type chart data
  const resolutionTimeData = data.resolutionByType
    .sort((a, b) => b.averageTime - a.averageTime)
    .map(item => ({
      name: item.typeName,
      time: Number(item.averageTime.toFixed(1)),
      count: item.ticketCount
    }));

  // Weekday distribution data reformatted for radar chart
  const weekdayData = Object.entries(data.weekdayDistribution).map(([day, count]) => ({
    subject: day.charAt(0).toUpperCase() + day.slice(1),
    count: count,
    fullMark: Math.max(...Object.values(data.weekdayDistribution)) + 5
  }));

  // Helper function to export chart data to CSV
  const exportChartData = (chartData: any[], filename: string) => {
    exportToCSV(chartData, filename);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Tickets Raised vs Closed Trend Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tickets Trend Over Time</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="flex rounded-md border">
              <Button 
                variant={activeTab === 'raised' ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab('raised')}
                className="rounded-r-none"
              >
                Raised
              </Button>
              <Button 
                variant={activeTab === 'closed' ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab('closed')}
                className="rounded-l-none"
              >
                Closed
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => exportChartData(trendChartData, 'ticket-trend-data.csv')}
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {activeTab === 'raised' ? (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="raised" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.3} 
                    name="Current Period" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="comparisonRaised" 
                    stroke="#9ca3af" 
                    fill="#9ca3af" 
                    fillOpacity={0.1} 
                    strokeDasharray="5 5" 
                    name="Comparison Period" 
                  />
                </>
              ) : (
                <>
                  <Area 
                    type="monotone" 
                    dataKey="closed" 
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.3} 
                    name="Current Period" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="comparisonClosed" 
                    stroke="#9ca3af" 
                    fill="#9ca3af"
                    fillOpacity={0.1} 
                    strokeDasharray="5 5" 
                    name="Comparison Period" 
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Priority Distribution Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Priority Distribution</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => exportChartData(priorityData, 'priority-distribution.csv')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={priorityColors[index % priorityColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Status Distribution</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => exportChartData(statusData, 'status-distribution.csv')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Resolution Time by Issue Type - Changed to heat map style bar chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Resolution Time by Issue Type</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => exportChartData(resolutionTimeData, 'resolution-time-by-type.csv')}
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={resolutionTimeData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" label={{ value: 'Hours', position: 'insideBottom', offset: -5 }} />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'time' ? `${value} hours` : `${value} tickets`,
                  name === 'time' ? 'Avg. Resolution Time' : 'Ticket Count'
                ]}
              />
              <Legend />
              <Bar 
                dataKey="time" 
                name="Avg. Resolution Time" 
                fill="#3b82f6"
              >
                {resolutionTimeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={`hsl(${220 - (entry.time / Math.max(...resolutionTimeData.map(d => d.time))) * 100}, 80%, 60%)`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Issue Types Chart - Changed to horizontal bar chart with gradient */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Top Issue Types</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => exportChartData(
              data.topIssueTypes.map(t => ({ name: t.typeName, count: t.count })),
              'top-issue-types.csv'
            )}
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data.topIssueTypes.map(t => ({ name: t.typeName, count: t.count }))}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
              <Legend />
              <Bar dataKey="count" name="Ticket Count">
                {data.topIssueTypes.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`hsl(${260 - index * 20}, 70%, 65%)`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekday vs Weekend Distribution - Changed to radar chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Weekday vs Weekend Ticket Flow</CardTitle>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const weekdayData = Object.entries(data.weekdayDistribution).map(([day, count]) => ({
                day: day.charAt(0).toUpperCase() + day.slice(1),
                count
              }));
              exportChartData(weekdayData, 'weekday-distribution.csv');
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart outerRadius={90} data={weekdayData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, 'auto']} />
              <Radar
                name="Ticket Count"
                dataKey="count"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Legend />
              <Tooltip formatter={(value) => [`${value} tickets`, "Count"]} />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketTrendCharts;
