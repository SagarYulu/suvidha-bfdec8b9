
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, AlertTriangle, Clock3 } from 'lucide-react';

type DashboardMetricsProps = {
  analytics: any;
  userCount: number;
  isLoading: boolean;
};

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ analytics, userCount, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">Loading...</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // If analytics data is not available or incomplete, show placeholder
  if (!analytics) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">No data available</p>
          </CardContent>
        </Card>
        {/* Duplicate cards for other metrics */}
      </div>
    );
  }

  // Safely get the average resolution time with a fallback
  const safeAvgResolutionTime = () => {
    if (analytics.averageResolutionTime === null || analytics.averageResolutionTime === undefined) {
      return "--";
    }
    return analytics.averageResolutionTime.toFixed(1);
  };

  // Calculate the percentage safely
  const calculatePercentage = () => {
    if (!analytics.in_progress || !analytics.total || analytics.total === 0) {
      return "0.0";
    }
    return ((analytics.in_progress / analytics.total) * 100).toFixed(1);
  };

  // Calculate tickets per employee safely
  const calculateTicketsPerEmployee = () => {
    if (!analytics.total || !userCount || userCount === 0) {
      return "0";
    }
    return (analytics.total / userCount).toFixed(1);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.total || 0}</div>
          <p className="text-xs text-muted-foreground">
            Open: {analytics.open || 0} / Closed: {analytics.closed || 0}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.in_progress || 0}</div>
          <p className="text-xs text-muted-foreground">
            {calculatePercentage()}% of all tickets
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount || 0}</div>
          <p className="text-xs text-muted-foreground">
            {calculateTicketsPerEmployee()} tickets per employee
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Resolution Time</CardTitle>
          <Clock3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{safeAvgResolutionTime()}</div>
          <p className="text-xs text-muted-foreground">
            Hours to resolution
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
