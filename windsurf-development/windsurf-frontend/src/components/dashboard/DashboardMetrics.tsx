
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Users, CheckCircle, Clock, TrendingUp } from "lucide-react";
import { apiService } from "@/services/api";
import { useErrorHandler } from "@/hooks/useErrorHandler";

interface MetricData {
  label: string;
  value: number;
  change: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const DashboardMetrics: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      
      // Fetch data from multiple endpoints
      const [issuesResponse, usersResponse, analyticsResponse] = await Promise.all([
        apiService.getIssues(),
        apiService.getUsers(),
        apiService.getAnalytics().catch(() => ({ totalIssues: 0, resolvedIssues: 0, pendingIssues: 0 }))
      ]);

      const issues = issuesResponse.issues || [];
      const users = usersResponse.users || [];
      
      const totalIssues = issues.length;
      const resolvedIssues = issues.filter((issue: any) => issue.status === 'resolved').length;
      const pendingIssues = issues.filter((issue: any) => issue.status === 'open' || issue.status === 'in_progress').length;
      const totalUsers = users.length;

      const metricsData: MetricData[] = [
        {
          label: 'Total Issues',
          value: totalIssues,
          change: 12, // Mock change percentage
          icon: Ticket,
          color: 'text-blue-600'
        },
        {
          label: 'Resolved Issues',
          value: resolvedIssues,
          change: 8,
          icon: CheckCircle,
          color: 'text-green-600'
        },
        {
          label: 'Pending Issues',
          value: pendingIssues,
          change: -5,
          icon: Clock,
          color: 'text-orange-600'
        },
        {
          label: 'Total Users',
          value: totalUsers,
          change: 15,
          icon: Users,
          color: 'text-purple-600'
        }
      ];

      setMetrics(metricsData);
    } catch (error) {
      handleError(error, 'Fetching dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.label}
              </CardTitle>
              <Icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center text-xs text-gray-600">
                <TrendingUp 
                  className={`h-3 w-3 mr-1 ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`} 
                />
                <span className={metric.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {metric.change >= 0 ? '+' : ''}{metric.change}%
                </span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DashboardMetrics;
