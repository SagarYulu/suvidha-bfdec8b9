
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getAnalytics } from "@/services/issues/issueAnalyticsService";
import { getUsers } from "@/services/userService";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer
} from 'recharts';
import { ISSUE_TYPES } from "@/config/issueTypes";
import FilterBar from "@/components/dashboard/FilterBar";
import { useDashboardData } from "@/hooks/useDashboardData";
import TrendAnalysisSection from "@/components/admin/analytics/TrendAnalysisSection";
import SLAAnalysisSection from "@/components/admin/analytics/SLAAnalysisSection";

const AdminAnalytics = () => {
  const { 
    analytics, 
    isLoading, 
    filters, 
    handleFilterChange,
    typePieData,
    cityBarData
  } = useDashboardData();

  const COLORS = [
    '#1E40AF', '#3B82F6', '#93C5FD', '#BFDBFE', 
    '#FBBF24', '#F59E0B', '#D97706', 
    '#10B981', '#059669', '#047857'
  ];

  const getIssueTypeLabel = (typeId: string) => {
    const issueType = ISSUE_TYPES.find(type => type.id === typeId);
    return issueType?.label || typeId;
  };

  const getClusterBarData = () => {
    if (!analytics?.clusterCounts) return [];
    
    return Object.entries(analytics.clusterCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  const getManagerBarData = () => {
    if (!analytics?.managerCounts) return [];
    
    return Object.entries(analytics.managerCounts).map(([name, value]: [string, any]) => ({
      name,
      value
    }));
  };

  return (
    <AdminLayout title="Analytics">
      {/* Filter Bar */}
      <div className="mb-6">
        <FilterBar 
          onFilterChange={handleFilterChange}
          initialFilters={filters}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yulu-blue"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
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
                <CardTitle className="text-lg">Open Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{analytics?.openIssues || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Issues pending resolution</p>
              </CardContent>
            </Card>
          </div>

          {/* Trend Analysis Section */}
          <TrendAnalysisSection filters={filters} />

          {/* SLA Analysis Section */}
          <SLAAnalysisSection filters={filters} />

          {/* Main Charts */}
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

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Issues by Cluster</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getClusterBarData()}
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
                    data={getManagerBarData()}
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
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAnalytics;
