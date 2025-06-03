
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';

interface SentimentDistributionChartProps {
  data: Array<{
    date: string;
    happy: number;
    neutral: number;
    sad: number;
    total: number;
  }>;
  showComparison?: boolean;
  title?: string;
}

const SentimentDistributionChart: React.FC<SentimentDistributionChartProps> = ({
  data,
  showComparison = false,
  title = "Sentiment Distribution Over Time"
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data && data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="happy" 
                  stroke={SENTIMENT_COLORS.happy} 
                  strokeWidth={2}
                  name="Happy"
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  stroke={SENTIMENT_COLORS.neutral} 
                  strokeWidth={2}
                  name="Neutral"
                />
                <Line 
                  type="monotone" 
                  dataKey="sad" 
                  stroke={SENTIMENT_COLORS.sad} 
                  strokeWidth={2}
                  name="Sad"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No data available for the selected period</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
