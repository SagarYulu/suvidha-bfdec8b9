
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { TATChart } from '@/components/TATChart';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import { 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  Clock,
  AlertTriangle,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

const AdminReports: React.FC = () => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('');
  const [reportData, setReportData] = useState({
    tatMetrics: { '≤14 days': 0, '14-30 days': 0, '>30 days': 0 },
    slaBreaches: { total: 0, breached: 0, percentage: 0 },
    avgResolutionTime: { avgDays: 0, resolvedCount: 0 },
    trendData: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const filters = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
        city: selectedCity || undefined,
        cluster: selectedCluster || undefined
      };

      const [tatResponse, slaResponse, avgTimeResponse, trendResponse] = await Promise.all([
        fetch(`/api/analytics/tat-metrics?${new URLSearchParams(filters)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`/api/analytics/sla-breaches?${new URLSearchParams(filters)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`/api/analytics/avg-resolution-time?${new URLSearchParams(filters)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        }),
        fetch(`/api/analytics/trends?${new URLSearchParams(filters)}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
      ]);

      const [tatMetrics, slaBreaches, avgResolutionTime, trendData] = await Promise.all([
        tatResponse.json(),
        slaResponse.json(),
        avgTimeResponse.json(),
        trendResponse.json()
      ]);

      setReportData({
        tatMetrics,
        slaBreaches,
        avgResolutionTime,
        trendData
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleExportData = async (format = 'csv') => {
    try {
      const filters = {
        startDate: dateRange.from?.toISOString(),
        endDate: dateRange.to?.toISOString(),
        city: selectedCity || undefined,
        cluster: selectedCluster || undefined,
        format
      };

      const response = await fetch(`/api/analytics/export?${new URLSearchParams(filters)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report exported successfully');
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    }
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExportData('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExportData('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select city..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Cities</SelectItem>
                <SelectItem value="Mumbai">Mumbai</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Bangalore">Bangalore</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCluster} onValueChange={setSelectedCluster}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select cluster..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Clusters</SelectItem>
                <SelectItem value="North">North</SelectItem>
                <SelectItem value="South">South</SelectItem>
                <SelectItem value="East">East</SelectItem>
                <SelectItem value="West">West</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchReportData} disabled={isLoading}>
              <Filter className="h-4 w-4 mr-2" />
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{reportData.avgResolutionTime.avgDays} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">SLA Breaches</p>
                <p className="text-2xl font-bold">{reportData.slaBreaches.percentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Issues</p>
                <p className="text-2xl font-bold">{reportData.slaBreaches.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold">{reportData.avgResolutionTime.resolvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TAT Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Turn Around Time Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <TATChart filters={{
              startDate: dateRange.from?.toISOString(),
              endDate: dateRange.to?.toISOString(),
              city: selectedCity || undefined,
              cluster: selectedCluster || undefined
            }} />
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Issue Resolution Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="totalIssues" stroke="#8884d8" name="Total Issues" />
                  <Line type="monotone" dataKey="resolvedIssues" stroke="#82ca9d" name="Resolved Issues" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600">Within SLA (≤14 days)</p>
                <p className="text-2xl font-bold text-green-800">{reportData.tatMetrics['≤14 days']}</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-600">Near Breach (14-30 days)</p>
                <p className="text-2xl font-bold text-yellow-800">{reportData.tatMetrics['14-30 days']}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">SLA Breach (>30 days)</p>
                <p className="text-2xl font-bold text-red-800">{reportData.tatMetrics['>30 days']}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminReports;
