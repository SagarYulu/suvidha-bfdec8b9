
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Dot
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { SENTIMENT_COLORS, CURVED_LINE_TYPE } from '@/components/charts/ChartUtils';

interface SentimentTrendData {
  date: string;
  happy: number;
  neutral: number; 
  sad: number;
  total?: number;
}

interface SentimentDistributionChartProps {
  data: SentimentTrendData[];
  showComparison?: boolean;
  title?: string;
}

// Custom dot for the lines
const CustomDot = (props: any) => {
  const { cx, cy, stroke, payload, value, dataKey } = props;

  // Don't render dots for zero values
  if (value === 0) return null;

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={4}
      fill={stroke}
      stroke="#fff"
      strokeWidth={1}
    />
  );
};

const SentimentDistributionChart: React.FC<SentimentDistributionChartProps> = ({ 
  data, 
  showComparison = false,
  title = "Sentiment Distribution Over Time"
}) => {
  // Check if data is loading or empty
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDataState message="No sentiment trend data available for the selected period." />
        </CardContent>
      </Card>
    );
  }

  // Format the data to ensure dates are displayed correctly
  const formattedData = data.map(item => ({
    ...item,
    formattedDate: new Date(item.date).toLocaleDateString()
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }} 
                tickMargin={10} 
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <Line 
                type={CURVED_LINE_TYPE}
                dataKey="happy"
                name="Happy" 
                stroke={SENTIMENT_COLORS.happy}
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                dot={<CustomDot />}
                strokeWidth={2}
                isAnimationActive={false} // Disable animation to reduce flickering
              />
              <Line 
                type={CURVED_LINE_TYPE}
                dataKey="neutral"
                name="Neutral" 
                stroke={SENTIMENT_COLORS.neutral}
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                dot={<CustomDot />}
                strokeWidth={2}
                isAnimationActive={false} // Disable animation to reduce flickering
              />
              <Line 
                type={CURVED_LINE_TYPE}
                dataKey="sad"
                name="Sad" 
                stroke={SENTIMENT_COLORS.sad}
                activeDot={{ r: 6, strokeWidth: 1, stroke: '#fff' }}
                dot={<CustomDot />}
                strokeWidth={2}
                isAnimationActive={false} // Disable animation to reduce flickering
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
