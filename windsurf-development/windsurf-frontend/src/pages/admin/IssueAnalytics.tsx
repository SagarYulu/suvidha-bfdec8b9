
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Download
} from 'lucide-react';

const IssueAnalytics: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('30d');

  // Mock data for analytics
  const issuesByType = [
    { name: 'Technical', value: 45, color: '#3B82F6' },
    { name: 'HR', value: 30, color: '#10B981' },
    { name: 'Payroll', value: 15, color: '#F59E0B' },
    { name: 'Leave', value: 10, color: '#EF4444' }
  ];

  const trendData = [
    { date: '2024-01-01', created: 12, resolved: 8, pending: 4 },
    { date: '2024-01-02', created: 15, resolved: 12, pending: 7 },
    { date: '2024-01-03', created: 8, resolved: 10, pending: 5 },
    { date: '2024-01-04', created: 20, resolved: 15, pending: 10 },
    { date: '2024-01-05', created: 18, resolved: 20, pending: 8 },
    { date: '2024-01-06', created: 25, resolved: 18, pending: 15 },
    { date: '2024-01-07', created: 22, resolved: 25, pending: 12 }
  ];

  const resolutionTimeData = [
    { category: 'Technical', avgTime: 4.2, slaTarget: 4.0 },
    { category: 'HR', avgTime: 2.8, slaTarget: 3.0 },
    { category: 'Payroll', avgTime: 1.5, slaTarget: 2.0 },
    { category: 'Leave', avgTime: 1.2, slaTarget: 1.5 }
  ];

  const priorityDistribution = [
    { name: 'Critical', value: 5, color: '#DC2626' },
    { name: 'High', value: 25, color: '#EA580C' },
    { name: 'Medium', value: 45, color: '#CA8A04' },
    { name: 'Low', value: 25, color: '#16A34A' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Issue Analytics</h1>
        <div className="flex space-x-2">
          <select 
            className="px-3 py-2 border rounded-md"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">324</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1 text-green-600" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolution Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89.2%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4h</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="inline h-3 w-3 mr-1 text-green-600" />
              -15min from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">94.8%</div>
            <p className="text-xs text-muted-foreground">
              Target: 95%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3B82F6" name="Created" />
                <Line type="monotone" dataKey="resolved" stroke="#10B981" name="Resolved" />
                <Line type="monotone" dataKey="pending" stroke="#F59E0B" name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Issues by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issuesByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {issuesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resolution Time vs SLA Target</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={resolutionTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgTime" fill="#3B82F6" name="Avg Resolution Time (hrs)" />
                <Bar dataKey="slaTarget" fill="#10B981" name="SLA Target (hrs)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SLA Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>SLA Performance by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Category</th>
                  <th className="text-left p-2">SLA Target</th>
                  <th className="text-left p-2">Avg Resolution</th>
                  <th className="text-left p-2">Compliance</th>
                  <th className="text-left p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {resolutionTimeData.map((item, index) => {
                  const compliance = ((item.slaTarget / item.avgTime) * 100).toFixed(1);
                  const isCompliant = item.avgTime <= item.slaTarget;
                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">{item.category}</td>
                      <td className="p-2">{item.slaTarget}h</td>
                      <td className="p-2">{item.avgTime}h</td>
                      <td className="p-2">{compliance}%</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          isCompliant 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {isCompliant ? 'On Track' : 'At Risk'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueAnalytics;
