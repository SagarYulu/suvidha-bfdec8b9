
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface TrendData {
  period: string;
  issues: number;
  resolved: number;
  responseTime: number;
}

interface TrendAnalysisSectionProps {
  data: TrendData[];
  isLoading?: boolean;
}

const TrendAnalysisSection: React.FC<TrendAnalysisSectionProps> = ({
  data,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const calculateTrend = (data: TrendData[]) => {
    if (data.length < 2) return 0;
    const latest = data[data.length - 1].issues;
    const previous = data[data.length - 2].issues;
    return ((latest - previous) / previous) * 100;
  };

  const trend = calculateTrend(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Trend Analysis
          <div className={`flex items-center ${trend >= 0 ? 'text-red-600' : 'text-green-600'}`}>
            {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            <span className="text-sm">{Math.abs(trend).toFixed(1)}%</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} name="Total Issues" />
              <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved Issues" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisSection;
