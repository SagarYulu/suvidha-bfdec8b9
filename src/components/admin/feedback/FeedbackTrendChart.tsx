
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { format, parse } from 'date-fns';

const COMPARISON_LABELS: Record<string, string> = {
  'dod': 'Day on Day',
  'wow': 'Week on Week',
  'mom': 'Month on Month',
  'qoq': 'Quarter on Quarter',
  'yoy': 'Year on Year'
};

interface FeedbackTrendChartProps {
  data: Array<{ date: string; happy: number; neutral: number; sad: number; total: number }>;
  showComparison: boolean;
  comparisonMode?: string;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({ 
  data,
  showComparison,
  comparisonMode = 'wow'
}) => {
  // Format dates for display
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: format(parse(item.date, 'yyyy-MM-dd', new Date()), 'MMM dd')
  }));
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Feedback Trend
          {showComparison && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({COMPARISON_LABELS[comparisonMode]})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} responses`, ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="happy" 
                  name="Happy"
                  stroke="#22c55e" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="neutral" 
                  name="Neutral"
                  stroke="#f59e0b" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
                <Line 
                  type="monotone" 
                  dataKey="sad" 
                  name="Sad"
                  stroke="#ef4444" 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No trend data available for the selected period
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendChart;
