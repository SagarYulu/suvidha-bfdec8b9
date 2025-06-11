
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import { DashboardAnalytics } from '@/types';

interface DashboardMetricsProps {
  analytics?: DashboardAnalytics;
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Issues',
      value: analytics?.totalIssues || 0,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Open Issues',
      value: analytics?.openIssues || 0,
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Resolved Issues',
      value: analytics?.resolvedIssues || 0,
      icon: TrendingDown,
      color: 'text-green-600'
    },
    {
      title: 'Total Users',
      value: userCount,
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              {analytics?.avgResolutionTime && index === 1 && (
                <p className="text-xs text-gray-500 mt-1">
                  Avg resolution: {Math.round(analytics.avgResolutionTime)}h
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;
