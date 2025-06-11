
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendData {
  date: string;
  rating: number;
  count: number;
  previousRating?: number;
}

interface FeedbackTrendChartProps {
  data: TrendData[];
  showComparison?: boolean;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({ 
  data, 
  showComparison = false 
}) => {
  const mockData: TrendData[] = [
    { date: '2024-01-01', rating: 4.1, count: 25, previousRating: 3.9 },
    { date: '2024-01-02', rating: 4.3, count: 32, previousRating: 4.0 },
    { date: '2024-01-03', rating: 4.0, count: 28, previousRating: 4.2 },
    { date: '2024-01-04', rating: 4.5, count: 35, previousRating: 4.1 },
    { date: '2024-01-05', rating: 4.2, count: 30, previousRating: 4.3 }
  ];

  const displayData = data.length > 0 ? data : mockData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback Rating Trend</CardTitle>
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
              <YAxis domain={[1, 5]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number, name: string) => [value.toFixed(1), name === 'rating' ? 'Current Rating' : 'Previous Rating']}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rating" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Current Period"
              />
              {showComparison && (
                <Line 
                  type="monotone" 
                  dataKey="previousRating" 
                  stroke="#64748b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Previous Period"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendChart;
