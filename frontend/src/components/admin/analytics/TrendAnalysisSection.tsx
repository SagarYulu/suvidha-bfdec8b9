
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendData {
  period: string;
  current: number;
  previous: number;
  target?: number;
}

interface TrendAnalysisSectionProps {
  title: string;
  data: TrendData[];
  metric: string;
  isLoading?: boolean;
}

const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  title,
  data,
  metric,
  isLoading = false
}) => {
  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'stable', percentage: 0 };
    
    const latest = data[data.length - 1].current;
    const previous = data[data.length - 2].current;
    
    if (previous === 0) return { direction: 'stable', percentage: 0 };
    
    const percentage = ((latest - previous) / previous) * 100;
    
    return {
      direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'stable',
      percentage: Math.abs(percentage)
    };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 animate-pulse rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {trend.percentage.toFixed(1)}%
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Period: ${label}`}
                formatter={(value, name) => [value, name === 'current' ? `Current ${metric}` : name === 'previous' ? `Previous ${metric}` : `Target ${metric}`]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#2563eb" 
                strokeWidth={2}
                name={`Current ${metric}`}
              />
              <Line 
                type="monotone" 
                dataKey="previous" 
                stroke="#64748b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name={`Previous ${metric}`}
              />
              {data.some(d => d.target !== undefined) && (
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#dc2626" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  name={`Target ${metric}`}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisSection;
