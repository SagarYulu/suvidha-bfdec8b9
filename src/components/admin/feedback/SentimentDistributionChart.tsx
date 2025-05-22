
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
  Dot,
  ReferenceLine
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

// Custom dot renderer that ensures dots are always visible for each data point
const CustomDot = (props: any) => {
  const { cx, cy, stroke, payload, value, dataKey } = props;
  
  // Always render dots, even for zero values (with smaller radius)
  const radius = value === 0 ? 3 : 5;
  
  return (
    <Dot
      cx={cx}
      cy={cy}
      r={radius}
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
  // Sort by date to ensure chronological order
  const formattedData = [...data]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(item => ({
      ...item,
      // Format date for display
      formattedDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      // Make sure all sentiment values exist (even if 0)
      happy: item.happy || 0,
      neutral: item.neutral || 0,
      sad: item.sad || 0
    }));

  // Calculate domain for Y-axis
  const maxValue = Math.max(
    ...formattedData.map(item => 
      Math.max(item.happy, item.neutral, item.sad)
    )
  );
  
  // Ensure Y-axis has some padding above max value
  const yAxisDomain = [0, Math.max(maxValue + 2, 10)];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 10,
                right: 30,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="formattedDate" 
                tick={{ fontSize: 12 }} 
                tickMargin={10}
                padding={{ left: 20, right: 20 }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fontSize: 12 }} 
                domain={yAxisDomain}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  padding: '10px'
                }}
                formatter={(value, name) => {
                  // Map internal names to display names
                  const displayNames = {
                    happy: 'Happy',
                    neutral: 'Neutral',
                    sad: 'Sad'
                  };
                  return [value, displayNames[name as keyof typeof displayNames] || name];
                }}
                labelFormatter={(label) => `Date: ${label}`}
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
                activeDot={{ r: 8, strokeWidth: 1, stroke: '#fff' }}
                dot={<CustomDot />}
                strokeWidth={3}
                isAnimationActive={false}
              />
              <Line 
                type={CURVED_LINE_TYPE}
                dataKey="neutral"
                name="Neutral" 
                stroke={SENTIMENT_COLORS.neutral}
                activeDot={{ r: 8, strokeWidth: 1, stroke: '#fff' }}
                dot={<CustomDot />}
                strokeWidth={3}
                isAnimationActive={false}
              />
              <Line 
                type={CURVED_LINE_TYPE}
                dataKey="sad"
                name="Sad" 
                stroke={SENTIMENT_COLORS.sad}
                activeDot={{ r: 8, strokeWidth: 1, stroke: '#fff' }}
                dot={<CustomDot />}
                strokeWidth={3}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionChart;
