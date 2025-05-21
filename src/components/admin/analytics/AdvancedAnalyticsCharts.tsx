
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from "recharts";
import { AdvancedFilters } from "./AdvancedAnalyticsSection";
import { useAdvancedAnalytics } from "@/hooks/useAdvancedAnalytics";

interface AdvancedAnalyticsChartsProps {
  filters: AdvancedFilters;
}

export const AdvancedAnalyticsCharts: React.FC<AdvancedAnalyticsChartsProps> = ({ filters }) => {
  const { data, isLoading, error } = useAdvancedAnalytics(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-5 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-gray-100 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load analytics data. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  // If there's no data yet, show placeholder
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Data</CardTitle>
          <CardDescription>
            Select filters above to view advanced analytics
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Use the filters above to analyze your data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">SLA Compliance Rate</CardTitle>
            <CardDescription>% of tickets resolved within target time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.slaComplianceRate?.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.slaComplianceRate > 90 ? "Good" : data.slaComplianceRate > 75 ? "Average" : "Needs Improvement"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Mean Time to Resolution</CardTitle>
            <CardDescription>Average time to close tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.mttr?.toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.mttrTrend > 0 
                ? `↑ ${data.mttrTrend.toFixed(1)}% increase vs previous period` 
                : `↓ ${Math.abs(data.mttrTrend).toFixed(1)}% decrease vs previous period`}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">First Response Time</CardTitle>
            <CardDescription>Average time to first response</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.firstResponseTime?.toFixed(1)} hrs</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.firstResponseTimeTrend > 0 
                ? `↑ ${data.firstResponseTimeTrend.toFixed(1)}% increase vs previous period` 
                : `↓ ${Math.abs(data.firstResponseTimeTrend).toFixed(1)}% decrease vs previous period`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>SLA Compliance Over Time</CardTitle>
            <CardDescription>How SLA compliance has changed over the period</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.slaComplianceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" domain={[0, 100]} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  name="SLA Compliance" 
                  stroke="#1E40AF" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution Time Trend</CardTitle>
            <CardDescription>Average time to resolution over the period</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.resolutionTimeTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit=" hrs" />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)} hrs`} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="hours" 
                  name="Resolution Time" 
                  stroke="#F59E0B" 
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Volume by Priority</CardTitle>
            <CardDescription>Distribution of tickets by priority level</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.ticketsByPriority || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="priority" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Tickets" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Distribution Over Time</CardTitle>
            <CardDescription>How ticket statuses have changed over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.statusTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="open" name="Open" stroke="#EF4444" />
                <Line type="monotone" dataKey="in_progress" name="In Progress" stroke="#F59E0B" />
                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10B981" />
                <Line type="monotone" dataKey="closed" name="Closed" stroke="#6366F1" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
