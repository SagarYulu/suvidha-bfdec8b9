
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface MetricData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface DashboardMetricsProps {
  metrics: MetricData[];
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ metrics }) => {
  const defaultMetrics: MetricData[] = [
    {
      title: 'Total Issues',
      value: '1,234',
      change: '+12%',
      trend: 'up',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      title: 'Resolved Issues',
      value: '987',
      change: '+8%',
      trend: 'up',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      title: 'Active Users',
      value: '456',
      change: '+3%',
      trend: 'up',
      icon: <Users className="h-4 w-4" />
    },
    {
      title: 'Avg Response Time',
      value: '2.4h',
      change: '-15%',
      trend: 'down',
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {displayMetrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
            {metric.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className={`text-xs flex items-center ${getTrendColor(metric.trend)}`}>
              {getTrendIcon(metric.trend)}
              <span className="ml-1">{metric.change} from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardMetrics;
