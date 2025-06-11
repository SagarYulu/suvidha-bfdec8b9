
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SENTIMENT_COLORS } from '@/components/charts/ChartUtils';

interface TrendData {
  date: string;
  happy: number;
  neutral: number;
  sad: number;
}

interface FeedbackTrendChartProps {
  data: TrendData[];
  showComparison?: boolean;
}

const FeedbackTrendChart: React.FC<FeedbackTrendChartProps> = ({
  data,
  showComparison = false
}) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feedback Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No trend data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorHappy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SENTIMENT_COLORS.happy} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={SENTIMENT_COLORS.happy} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={SENTIMENT_COLORS.neutral} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={SENTIMENT_COLORS.sad} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={SENTIMENT_COLORS.sad} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="happy" 
                stackId="1" 
                stroke={SENTIMENT_COLORS.happy} 
                fill="url(#colorHappy)" 
                name="Happy"
              />
              <Area 
                type="monotone" 
                dataKey="neutral" 
                stackId="1" 
                stroke={SENTIMENT_COLORS.neutral} 
                fill="url(#colorNeutral)" 
                name="Neutral"
              />
              <Area 
                type="monotone" 
                dataKey="sad" 
                stackId="1" 
                stroke={SENTIMENT_COLORS.sad} 
                fill="url(#colorSad)" 
                name="Sad"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTrendChart;
