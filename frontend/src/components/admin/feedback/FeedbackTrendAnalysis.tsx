
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface FeedbackTrendAnalysisProps {
  data: TrendData[];
}

const FeedbackTrendAnalysis: React.FC<FeedbackTrendAnalysisProps> = ({
  data = []
}) => {
  const mockData: TrendData[] = [
    { date: '2024-01-01', positive: 45, neutral: 30, negative: 15 },
    { date: '2024-01-02', positive: 52, neutral: 28, negative: 12 },
    { date: '2024-01-03', positive: 48, neutral: 32, negative: 18 },
    { date: '2024-01-04', positive: 55, neutral: 25, negative: 10 },
    { date: '2024-01-05', positive: 50, neutral: 30, negative: 15 }
  ];

  const displayData = data.length > 0 ? data : mockData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Trend Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="positive" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Positive"
              />
              <Line 
                type="monotone" 
                dataKey="neutral" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Neutral"
              />
              <Line 
                type="monotone" 
                dataKey="negative" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Negative"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendAnalysis;
