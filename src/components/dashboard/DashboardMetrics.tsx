
import React, { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketCheck, CheckCircle, Clock, Users } from "lucide-react";

type DashboardMetricsProps = {
  analytics: any;
  userCount: number;
  isLoading: boolean;
};

// Using memo to prevent unnecessary re-renders
const DashboardMetrics = memo(({ analytics, userCount, isLoading }: DashboardMetricsProps) => {
  if (isLoading) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          <TicketCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.totalIssues || 0}</div>
          <p className="text-xs text-muted-foreground">Total tickets raised</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resolved Tickets</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.resolvedIssues || 0}</div>
          <p className="text-xs text-muted-foreground">
            {analytics ? (analytics.resolutionRate.toFixed(1) + '% resolution rate') : '0% resolution rate'}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Resolution Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics?.avgResolutionTime || '0'} hrs</div>
          <p className="text-xs text-muted-foreground">Average time to resolve tickets</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Employees</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
          <p className="text-xs text-muted-foreground">Total employees registered</p>
        </CardContent>
      </Card>
    </div>
  );
});

// Display name for debugging
DashboardMetrics.displayName = 'DashboardMetrics';

export default DashboardMetrics;
