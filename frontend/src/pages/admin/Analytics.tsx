
import React from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics: React.FC = () => {
  // Mock data for charts
  const issuesByType = [
    { name: 'Salary', value: 45 },
    { name: 'Leave', value: 32 },
    { name: 'Technical', value: 28 },
    { name: 'Performance', value: 15 },
    { name: 'Administrative', value: 12 },
  ];

  const monthlyTrends = [
    { month: 'Jan', issues: 45, resolved: 40 },
    { month: 'Feb', issues: 52, resolved: 48 },
    { month: 'Mar', issues: 48, resolved: 45 },
    { month: 'Apr', issues: 61, resolved: 55 },
    { month: 'May', issues: 55, resolved: 52 },
    { month: 'Jun', issues: 67, resolved: 60 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <AdminLayout title="Analytics">
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">987</div>
              <p className="text-xs text-muted-foreground">80% resolution rate</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24h</div>
              <p className="text-xs text-muted-foreground">-8% improvement</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">456</div>
              <p className="text-xs text-muted-foreground">+5% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Issues by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Issues by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issuesByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {issuesByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="issues" fill="#8884d8" name="Issues Created" />
                    <Bar dataKey="resolved" fill="#82ca9d" name="Issues Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">92%</div>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">4.2h</div>
                <p className="text-sm text-gray-600">First Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">98%</div>
                <p className="text-sm text-gray-600">SLA Compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Analytics;
