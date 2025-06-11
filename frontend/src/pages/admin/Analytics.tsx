
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { IssueService } from '@/services/issueService';

export default function Analytics() {
  const [timeRange, setTimeRange] = useState('7d');
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
    avgResolutionTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await IssueService.getIssueStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusPercentage = (count: number) => {
    return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : '0';
  };

  const statCards = [
    {
      title: 'Total Issues',
      value: stats.total,
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Open Issues',
      value: stats.open,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      percentage: getStatusPercentage(stats.open)
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'bg-yellow-500',
      percentage: getStatusPercentage(stats.inProgress)
    },
    {
      title: 'Resolved',
      value: stats.resolved,
      icon: CheckCircle,
      color: 'bg-green-500',
      percentage: getStatusPercentage(stats.resolved)
    },
    {
      title: 'Closed',
      value: stats.closed,
      icon: XCircle,
      color: 'bg-gray-500',
      percentage: getStatusPercentage(stats.closed)
    },
    {
      title: 'Avg Resolution Time',
      value: `${stats.avgResolutionTime}h`,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '-5%'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Monitor issue trends and performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-2xl font-bold">{stat.value}</span>
                      {stat.percentage && (
                        <span className="ml-2 text-sm text-gray-500">
                          ({stat.percentage}%)
                        </span>
                      )}
                    </div>
                    {stat.change && (
                      <div className="flex items-center mt-1">
                        <Badge
                          variant="secondary"
                          className={
                            stat.change.startsWith('+')
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }
                        >
                          {stat.change}
                        </Badge>
                        <span className="text-xs text-gray-500 ml-2">vs last period</span>
                      </div>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Open', value: stats.open, color: 'bg-orange-500' },
                { label: 'In Progress', value: stats.inProgress, color: 'bg-yellow-500' },
                { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
                { label: 'Closed', value: stats.closed, color: 'bg-gray-500' }
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 ${item.color} rounded-full mr-3`}></div>
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm text-gray-600">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center text-gray-500 py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p>Activity chart would be displayed here</p>
                <p className="text-sm">Integration with charts library needed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
