
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

interface DashboardMetricsProps {
  analytics: any;
  userCount: number;
  isLoading: boolean;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  analytics,
  userCount,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Issues",
      value: analytics?.totalIssues || 0,
      description: "All time issues",
      icon: AlertCircle,
      color: "text-blue-600"
    },
    {
      title: "Open Issues",
      value: analytics?.openIssues || 0,
      description: "Currently open",
      icon: AlertCircle,
      color: "text-orange-600"
    },
    {
      title: "Resolved Issues",
      value: analytics?.resolvedIssues || 0,
      description: "Successfully resolved",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Avg Resolution Time",
      value: `${Math.round(analytics?.avgResolutionTime || 0)}h`,
      description: "Average time to resolve",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Total Users",
      value: userCount || 0,
      description: "Active users",
      icon: Users,
      color: "text-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;
