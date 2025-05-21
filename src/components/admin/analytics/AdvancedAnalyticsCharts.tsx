
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdvancedFilters } from "./types";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { 
  ArrowUp, ArrowDown, ChartPie, ChartBar, 
  ChartBarHorizontal, TrendingDown, TrendingUp, 
  Bell, Clock, Percent, Ticket, Users, Repeat 
} from "lucide-react";
import TopicRadarChart from "@/components/charts/TopicRadarChart";

interface AdvancedAnalyticsChartsProps {
  filters: AdvancedFilters;
}

const COLORS = ['#1E40AF', '#3B82F6', '#93C5FD', '#BFDBFE', '#FBBF24', '#F59E0B', '#D97706', '#10B981', '#059669', '#047857'];

export const AdvancedAnalyticsCharts: React.FC<AdvancedAnalyticsChartsProps> = ({ filters }) => {
  const { data: analyticsData, isLoading, error } = useAdvancedAnalytics(filters);
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was a problem loading the analytics data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!analyticsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Advanced Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-gray-500">
              <p>No data available for the selected filters.</p>
              <p className="mt-2 text-sm">Try adjusting your filters or date range.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Format functions
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(Math.round(num * 100) / 100);
  };
  
  const formatPercent = (num: number) => {
    return `${formatNumber(num)}%`;
  };
  
  const formatHours = (num: number) => {
    return `${formatNumber(num)} hrs`;
  };
  
  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard 
          title="Total Tickets Raised" 
          value={formatNumber(analyticsData.totalTickets)} 
          icon={<Ticket className="h-5 w-5" />}
          className="bg-blue-50" 
        />
        
        <KpiCard 
          title="Resolved Tickets" 
          value={formatNumber(analyticsData.resolvedTickets)} 
          icon={<Ticket className="h-5 w-5 text-green-600" />}
          className="bg-green-50" 
        />
        
        <KpiCard 
          title="Resolution Rate" 
          value={formatPercent(analyticsData.resolutionRate)} 
          icon={<Percent className="h-5 w-5 text-blue-600" />}
          className="bg-blue-50" 
        />
        
        <KpiCard 
          title="Open Tickets" 
          value={formatNumber(analyticsData.openTickets)} 
          icon={<Ticket className="h-5 w-5 text-yellow-600" />}
          className="bg-yellow-50" 
        />
        
        <KpiCard 
          title="FTRS Time" 
          value={formatHours(analyticsData.ftrsTime)} 
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          className="bg-purple-50" 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard 
          title="First Response SLA Breach" 
          value={formatPercent(analyticsData.firstResponseSLABreach)} 
          icon={<Percent className="h-5 w-5 text-red-600" />}
          className="bg-red-50" 
        />
        
        <KpiCard 
          title="First Time Resolution" 
          value={formatPercent(analyticsData.ftrRate)} 
          icon={<Percent className="h-5 w-5 text-green-600" />}
          className="bg-green-50" 
        />
        
        <KpiCard 
          title="Avg Resolution Time" 
          value={formatHours(analyticsData.avgResolutionTime)} 
          icon={<Clock className="h-5 w-5 text-blue-600" />}
          className="bg-blue-50" 
        />
        
        <KpiCard 
          title="Resolution SLA Breach" 
          value={formatPercent(analyticsData.resolutionSLABreach)} 
          icon={<Percent className="h-5 w-5 text-red-600" />}
          className="bg-red-50" 
        />
        
        <KpiCard 
          title="Reopen Count & Rate" 
          value={`${formatNumber(analyticsData.reopenCount)} (${formatPercent(analyticsData.reopenRate)})`} 
          icon={<Repeat className="h-5 w-5 text-orange-600" />}
          className="bg-orange-50" 
        />
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartPie className="h-5 w-5 text-blue-600" />
              Priority-wise Ticket Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="priority"
                  label={({ priority, percent }) => `${priority}: ${(percent * 100).toFixed(0)}%`}
                >
                  {analyticsData.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-blue-600" />
              Status-wise Ticket Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.statusDistribution}
                layout="horizontal"
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Legend />
                <Bar dataKey="count" name="Tickets" fill="#1E40AF" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBarHorizontal className="h-5 w-5 text-blue-600" />
              Top 5 Frequent Issue Types
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.topIssueTypes}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 30,
                  left: 100,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="type" />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Legend />
                <Bar dataKey="count" name="Tickets" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="h-5 w-5 text-blue-600" />
              Weekday vs Weekend Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.weekdayVsWeekend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayType" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} tickets`, 'Count']} />
                <Legend />
                <Bar dataKey="count" name="Tickets" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts - Third Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Assignee Reply Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData.assigneeReplyTrend}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 40,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="assignee" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} replies`, 'Count']} />
                <Legend />
                <Bar dataKey="replies" name="Replies" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analyticsData.ticketSpikeData.hasSpike ? (
                <TrendingUp className="h-5 w-5 text-red-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-green-600" />
              )}
              Ticket Spike Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex flex-col justify-center">
            {analyticsData.ticketSpikeData.hasSpike ? (
              <div className="p-6 bg-red-50 rounded-lg text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm mb-4">
                  <Bell className="h-4 w-4 mr-1" />
                  Alert
                </div>
                <h3 className="text-2xl font-bold text-red-700">
                  {formatPercent(analyticsData.ticketSpikeData.spikePercentage)} Spike Detected
                </h3>
                <p className="mt-2 text-red-600">
                  Tickets increased from {formatNumber(analyticsData.ticketSpikeData.previousPeriodCount)} to {formatNumber(analyticsData.ticketSpikeData.currentPeriodCount)}
                </p>
              </div>
            ) : (
              <div className="p-6 bg-green-50 rounded-lg text-center">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm mb-4">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  Normal
                </div>
                <h3 className="text-2xl font-bold text-green-700">
                  No Unusual Spikes
                </h3>
                <p className="mt-2 text-green-600">
                  Current period: {formatNumber(analyticsData.ticketSpikeData.currentPeriodCount)} tickets
                  <br/>
                  Previous period: {formatNumber(analyticsData.ticketSpikeData.previousPeriodCount)} tickets
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// KPI Card Component
interface KpiCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, className }) => {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          {icon}
        </div>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};
