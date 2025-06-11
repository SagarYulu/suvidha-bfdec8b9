
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalytics } from "@/services/issueService";
import { Analytics } from "@/types";
import { BarChart3, Users, AlertCircle, TrendingUp, CheckCircle2 } from "lucide-react";

const Dashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const metrics = [
    {
      title: "Total Issues",
      value: analytics?.totalIssues || 0,
      icon: AlertCircle,
      description: "All reported issues",
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Open Issues",
      value: analytics?.openIssues || 0,
      icon: AlertCircle,
      description: "Issues awaiting response",
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "In Progress",
      value: analytics?.inProgressIssues || 0,
      icon: TrendingUp,
      description: "Issues being worked on",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Resolved",
      value: analytics?.resolvedIssues || 0,
      icon: CheckCircle2,
      description: "Successfully resolved",
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your issue management system</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <div className={`p-2 rounded-md ${metric.bgColor}`}>
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Types Distribution</CardTitle>
            <CardDescription>
              Breakdown of issues by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.typeCounts && Object.keys(analytics.typeCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(analytics.typeCounts).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
            <CardDescription>
              Issues breakdown by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.priorityCounts && Object.keys(analytics.priorityCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(analytics.priorityCounts).map(([priority, count]) => (
                  <div key={priority} className="flex justify-between items-center">
                    <span className="text-sm capitalize">{priority}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>
            System performance indicators
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analytics?.resolutionRate ? `${analytics.resolutionRate.toFixed(1)}%` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Resolution Rate</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {analytics?.avgResolutionTime ? `${analytics.avgResolutionTime.toFixed(1)}h` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Avg Resolution Time</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {analytics?.avgFirstResponseTime ? `${analytics.avgFirstResponseTime.toFixed(1)}h` : 'N/A'}
              </div>
              <p className="text-sm text-gray-600">Avg First Response</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
