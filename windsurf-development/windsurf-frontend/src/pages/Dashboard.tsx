
import React from "react";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TATChart } from "@/components/TATChart";
import { StatusTimeline } from "@/components/StatusTimeline";
import { TicketCheck, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { analyticsService } from "@/services/analyticsService";

const Dashboard = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: tatData, isLoading: tatLoading } = useQuery({
    queryKey: ['tat-metrics'],
    queryFn: () => analyticsService.getTATMetrics(),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: recentIssues, isLoading: issuesLoading } = useQuery({
    queryKey: ['recent-issues'],
    queryFn: () => analyticsService.getRecentIssues(10),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  if (isLoading || tatLoading || issuesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="space-y-0 pb-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <TicketCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.totalIssues || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time issues raised
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.resolvedIssues || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.resolutionRate || 0}% resolution rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tatData?.averageTAT || 0}h</div>
              <p className="text-xs text-muted-foreground">
                Working hours (9AM-5PM, Mon-Sat)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.pendingIssues || 0}</div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>TAT Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <TATChart data={tatData?.buckets || {}} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Issue Status Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <StatusTimeline issues={recentIssues || []} />
            </CardContent>
          </Card>
        </div>

        {/* Recent Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">ID</th>
                    <th className="text-left p-2">Description</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Priority</th>
                    <th className="text-left p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentIssues?.map((issue: any) => (
                    <tr key={issue.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-mono text-xs">#{issue.id.slice(0, 8)}</td>
                      <td className="p-2 max-w-xs truncate">{issue.description}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          issue.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.priority === 'high' ? 'bg-red-100 text-red-800' :
                          issue.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="p-2 text-gray-600">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
