
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendDataPoint {
  period: string;
  feedback: number;
  satisfaction: number;
  responseRate: number;
}

interface FeedbackTrendChartProps {
  data: TrendDataPoint[];
  isLoading?: boolean;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="feedback" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Total Feedback"
                />
                <Line 
                  type="monotone" 
                  dataKey="satisfaction" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Satisfaction %"
                />
                <Line 
                  type="monotone" 
                  dataKey="responseRate" 
                  stroke="#ffc658" 
                  strokeWidth={2}
                  name="Response Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No trend data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendChart;
