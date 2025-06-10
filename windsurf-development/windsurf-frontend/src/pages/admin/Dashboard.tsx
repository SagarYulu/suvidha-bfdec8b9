
import React from "react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from "@/components/AdminLayout";
import FilterBar from "@/components/dashboard/FilterBar";
import DashboardMetrics from "@/components/dashboard/DashboardMetrics";
import ChartSection from "@/components/dashboard/ChartSection";
import RecentTicketsTable from "@/components/dashboard/RecentTicketsTable";
import DashboardLoader from "@/components/dashboard/DashboardLoader";
import { useDashboardData } from "@/hooks/useDashboardData";
import { formatConsistentIssueData } from "@/services/issues/issueProcessingService";
import TATChart from "@/components/TATChart";
import StatusTimeline from "@/components/StatusTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Users,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Separate the inner component to use hooks
const DashboardContent = () => {
  const { 
    analytics,
    recentIssues,
    isLoading,
    userCount,
    handleFilterChange,
    typePieData,
    cityBarData,
    filters,
  } = useDashboardData();

  // Format issues consistently with the other pages
  const formattedRecentIssues = React.useMemo(() => {
    if (!recentIssues) return [];
    return formatConsistentIssueData(recentIssues);
  }, [recentIssues]);

  // Debug logging for current filters
  React.useEffect(() => {
    console.log("Dashboard current filters:", filters);
  }, [filters]);

  // Mock TAT data for demonstration
  const tatData = {
    '≤14 days': analytics?.tat?.within_14_days || 0,
    '14-30 days': analytics?.tat?.between_14_30_days || 0,
    '>30 days': analytics?.tat?.over_30_days || 0
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (isLoading && !analytics) {
    return (
      <AdminLayout title="Dashboard">
        <DashboardLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Filter Bar */}
        <FilterBar 
          onFilterChange={handleFilterChange} 
          initialFilters={filters}
        />

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics?.metrics?.total_issues || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time issues raised
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {analytics?.metrics?.open_issues || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {analytics?.metrics?.in_progress_issues || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {analytics?.metrics?.resolved_issues || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {analytics?.metrics?.resolution_rate || 0}% completion rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SLA and Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                SLA Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics?.sla?.compliance || 95}%
              </div>
              <p className="text-sm text-muted-foreground">
                Issues resolved within 48h
              </p>
              <div className="mt-2">
                <Badge variant={analytics?.sla?.compliance >= 90 ? "default" : "destructive"}>
                  {analytics?.sla?.breached || 0} breached
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                Avg Resolution Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {analytics?.tat?.average || 24}h
              </div>
              <p className="text-sm text-muted-foreground">
                Business hours (9AM-5PM)
              </p>
              <div className="mt-2">
                <Badge variant="outline">
                  {analytics?.tat?.median || 18}h median
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-500" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userCount || 0}</div>
              <p className="text-sm text-muted-foreground">
                Registered users
              </p>
              <div className="mt-2">
                <Badge variant="outline">
                  {analytics?.metrics?.active_agents || 0} agents
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>TAT Distribution</CardTitle>
              <p className="text-sm text-muted-foreground">
                Time to resolution buckets
              </p>
            </CardHeader>
            <CardContent>
              <TATChart data={tatData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest issue status changes
              </p>
            </CardHeader>
            <CardContent>
              <StatusTimeline issues={formattedRecentIssues} />
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Section */}
        <ChartSection 
          typePieData={typePieData}
          cityBarData={cityBarData}
          isLoading={isLoading}
        />

        {/* Recent Issues Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Issues</CardTitle>
              <p className="text-sm text-muted-foreground">
                Latest tickets and their status
              </p>
            </div>
            <Button variant="outline" size="sm">
              View All Issues
            </Button>
          </CardHeader>
          <CardContent>
            {formattedRecentIssues?.length > 0 ? (
              <div className="space-y-4">
                {formattedRecentIssues.slice(0, 5).map((issue: any) => (
                  <div 
                    key={issue.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium line-clamp-1">
                          {issue.title || issue.description?.substring(0, 50)}
                        </h4>
                        <Badge className={getPriorityColor(issue.priority)}>
                          {issue.priority?.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {issue.employee_name} • {issue.type_id}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(issue.status)}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500 min-w-fit">
                        {new Date(issue.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No recent issues found</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Legacy Components for Compatibility */}
        <div className="hidden">
          <DashboardMetrics 
            analytics={analytics} 
            userCount={userCount}
            isLoading={isLoading} 
          />
          <RecentTicketsTable 
            recentIssues={formattedRecentIssues}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AdminLayout>
  );
};

// Main component that provides the query client
const AdminDashboard = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
};

export default AdminDashboard;
