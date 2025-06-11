
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

interface TrendChartData {
  period: string;
  feedback: number;
  rating: number;
  responseRate: number;
}

interface FeedbackTrendChartProps {
  data: TrendChartData[];
  title: string;
  period: 'daily' | 'weekly' | 'monthly';
  isLoading?: boolean;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({
  data,
  title,
  period,
  isLoading = false
}) => {
  const formatPeriod = (value: string) => {
    const date = new Date(value);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString();
      case 'weekly':
        return `Week ${date.getWeek()}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      default:
        return value;
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            No trend data available for this period
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="feedbackGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="period" 
                tickFormatter={formatPeriod}
              />
              <YAxis yAxisId="count" orientation="left" />
              <YAxis yAxisId="percentage" orientation="right" />
              <Tooltip 
                labelFormatter={formatPeriod}
                formatter={(value, name) => [
                  name === 'feedback' ? value : 
                  name === 'rating' ? `${value}/5.0` :
                  `${value}%`,
                  name === 'feedback' ? 'Feedback Count' :
                  name === 'rating' ? 'Average Rating' :
                  'Response Rate'
                ]}
              />
              <Legend />
              <Area
                yAxisId="count"
                type="monotone"
                dataKey="feedback"
                stroke="#2563eb"
                fillOpacity={1}
                fill="url(#feedbackGradient)"
                name="Feedback Count"
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="rating"
                stroke="#dc2626"
                strokeWidth={2}
                name="Average Rating"
              />
              <Line
                yAxisId="percentage"
                type="monotone"
                dataKey="responseRate"
                stroke="#059669"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Response Rate %"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to get week number
declare global {
  interface Date {
    getWeek(): number;
  }
}

Date.prototype.getWeek = function() {
  const date = new Date(this.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  const week1 = new Date(date.getFullYear(), 0, 4);
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
};

export default FeedbackTrendChart;
