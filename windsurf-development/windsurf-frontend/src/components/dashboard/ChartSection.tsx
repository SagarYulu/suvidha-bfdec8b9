
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiService } from "@/services/api";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const ChartSection: React.FC = () => {
  const [issuesByStatus, setIssuesByStatus] = useState<any[]>([]);
  const [issuesByMonth, setIssuesByMonth] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const issuesResponse = await apiService.getIssues();
      const issues = issuesResponse.issues || [];

      // Process data for charts
      processIssuesByStatus(issues);
      processIssuesByMonth(issues);
    } catch (error) {
      handleError(error, 'Fetching chart data');
    } finally {
      setLoading(false);
    }
  };

  const processIssuesByStatus = (issues: any[]) => {
    const statusCounts = issues.reduce((acc: any, issue: any) => {
      const status = issue.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      count
    }));

    setIssuesByStatus(chartData);
  };

  const processIssuesByMonth = (issues: any[]) => {
    const monthlyData = issues.reduce((acc: any, issue: any) => {
      const date = new Date(issue.created_at || Date.now());
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      acc[monthKey] = (acc[monthKey] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.entries(monthlyData).map(([month, count]) => ({
      month,
      issues: count
    }));

    setIssuesByMonth(chartData.slice(-6)); // Last 6 months
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Issues by Status - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={issuesByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {issuesByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Issues by Month - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Issues Trend (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={issuesByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="issues" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartSection;
