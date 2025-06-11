
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ApiClient } from '@/services/apiClient';
import { TrendingUp } from 'lucide-react';

interface MoodTrendData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  average: number;
}

interface MoodTrendSectionProps {
  filters?: any;
}

const MoodTrendSection: React.FC<MoodTrendSectionProps> = ({ filters = {} }) => {
  const [data, setData] = useState<MoodTrendData[]>([]);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMoodTrend();
  }, [period, filters]);

  const fetchMoodTrend = async () => {
    setIsLoading(true);
    try {
      const response = await ApiClient.get(`/api/sentiment/mood-trend?period=${period}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch mood trend:', error);
      // Mock data for development
      setData([
        { date: '2024-01-01', positive: 65, neutral: 25, negative: 10, average: 4.2 },
        { date: '2024-01-02', positive: 70, neutral: 20, negative: 10, average: 4.3 },
        { date: '2024-01-03', positive: 60, neutral: 30, negative: 10, average: 4.0 },
        { date: '2024-01-04', positive: 75, neutral: 15, negative: 10, average: 4.5 },
        { date: '2024-01-05', positive: 68, neutral: 22, negative: 10, average: 4.2 }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey !== 'average' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Mood Trend Analysis
        </CardTitle>
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Track sentiment changes over time
          </p>
          <Select value={period} onValueChange={(value: '7d' | '30d' | '90d') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[1, 5]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="positive" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Positive %"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="neutral" 
                stroke="#F59E0B" 
                strokeWidth={2}
                name="Neutral %"
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="negative" 
                stroke="#EF4444" 
                strokeWidth={2}
                name="Negative %"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="average" 
                stroke="#6366F1" 
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Avg Rating"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodTrendSection;
