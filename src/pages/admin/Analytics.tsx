
import { useEffect, useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAnalytics } from "@/services/issues/issueAnalyticsService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { ISSUE_TYPES } from "@/config/issueTypes";
import { AdvancedAnalyticsSection } from "@/components/admin/analytics/AdvancedAnalyticsSection";
import { Skeleton } from "@/components/ui/skeleton";

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: null,
    cluster: null,
    issueType: null,
    dateRange: {
      start: null,
      end: null
    }
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching analytics data with filters:", filters);
        // Pass filters to getAnalytics
        const analyticsData = await getAnalytics({
          employeeUuids: [], // This would be populated based on city/cluster filters
          issueType: filters.issueType,
          dateRange: {
            start: filters.dateRange.start,
            end: filters.dateRange.end
          }
        });
        console.log("Analytics data received:", analyticsData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [filters]); // This will re-fetch data whenever filters change

  const handleFilterChange = (newFilters) => {
    console.log("Filters updated:", newFilters);
    // Convert filter format to match what getAnalytics expects
    setFilters({
      city: newFilters.city,
      cluster: newFilters.cluster,
      issueType: newFilters.issueType,
      dateRange: {
        start: newFilters.dateRange?.from ? newFilters.dateRange.from : null,
        end: newFilters.dateRange?.to ? newFilters.dateRange.to : null
      }
    });
  };

  const COLORS = [
    '#1E40AF', '#3B82F6', '#93C5FD', '#BFDBFE', 
    '#FBBF24', '#F59E0B', '#D97706', 
    '#10B981', '#059669', '#047857'
  ];

  const getIssueTypeLabel = (typeId: string) => {
    const issueType = ISSUE_TYPES.find(type => type.id === typeId);
    return issueType?.label || typeId;
  };

  // Format data for charts - useMemo to prevent recalculations on render
  const typePieData = useMemo(() => {
    if (!analytics?.typeCounts) return [];
    
    return Object.entries(analytics.typeCounts).map(([typeId, count]: [string, any]) => ({
      name: getIssueTypeLabel(typeId),
      value: count
    }));
  }, [analytics?.typeCounts]);

  const cityBarData = useMemo(() => {
    if (!analytics?.cityCounts) return [];
    
    return Object.entries(analytics.cityCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  }, [analytics?.cityCounts]);

  const clusterBarData = useMemo(() => {
    if (!analytics?.clusterCounts) return [];
    
    return Object.entries(analytics.clusterCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  }, [analytics?.clusterCounts]);

  const managerBarData = useMemo(() => {
    if (!analytics?.managerCounts) return [];
    
    return Object.entries(analytics.managerCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  }, [analytics?.managerCounts]);

  // Calculate the total of open and in-progress issues
  const totalOpenAndInProgressIssues = useMemo(() => {
    return analytics ? (analytics.openIssues || 0) + (analytics.inProgressIssues || 0) : 0;
  }, [analytics]);

  return (
    <AdminLayout title="Analytics">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-1/2" />
                  <Skeleton className="h-3 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[400px] w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.totalIssues || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All issues raised</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Resolution Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {analytics ? (analytics.resolutionRate.toFixed(1) + '%') : '0%'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Issues resolved / total issues</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Avg Resolution Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.avgResolutionTime || '0'} hrs</div>
                <p className="text-xs text-muted-foreground mt-1">Average time to close issues</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">First Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.avgFirstResponseTime || '0'} hrs</div>
                <p className="text-xs text-muted-foreground mt-1">Average time to first response</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Open & In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalOpenAndInProgressIssues}</div>
                <p className="text-xs text-muted-foreground mt-1">Issues pending resolution</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Type</CardTitle>
                <CardDescription>Distribution of issues by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {typePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Issues by City</CardTitle>
                <CardDescription>Distribution of issues across cities</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cityBarData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Issues" fill="#1E40AF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Cluster</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={clusterBarData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Issues" fill="#FBBF24" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Issues by Manager</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={managerBarData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" name="Issues" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Advanced analytics section with filter passing */}
          <AdvancedAnalyticsSection onFilterChange={handleFilterChange} />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
