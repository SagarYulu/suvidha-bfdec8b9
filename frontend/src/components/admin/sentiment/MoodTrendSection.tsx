
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MoodDataPoint {
  date: string;
  averageMood: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalFeedback: number;
}

interface MoodTrendSectionProps {
  data: MoodDataPoint[];
  timeframe: string;
}

const MoodTrendSection: React.FC<MoodTrendSectionProps> = ({ data, timeframe }) => {
  // Calculate overall trend
  const calculateTrend = () => {
    if (data.length < 2) return 'stable';
    const first = data[0].averageMood;
    const last = data[data.length - 1].averageMood;
    const change = ((last - first) / first) * 100;
    
    if (change > 5) return 'up';
    if (change < -5) return 'down';
    return 'stable';
  };

  const trend = calculateTrend();
  const averageMood = data.reduce((sum, point) => sum + point.averageMood, 0) / data.length;
  const totalFeedback = data.reduce((sum, point) => sum + point.totalFeedback, 0);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTooltip = (value: number, name: string) => {
    if (name === 'averageMood') {
      return [value.toFixed(2), 'Average Mood Score'];
    }
    return [value, name];
  };

  const getMoodLabel = (score: number) => {
    if (score >= 4) return 'Very Positive';
    if (score >= 3) return 'Positive';
    if (score >= 2) return 'Neutral';
    if (score >= 1) return 'Negative';
    return 'Very Negative';
  };

  const getMoodColor = (score: number) => {
    if (score >= 4) return '#22c55e';
    if (score >= 3) return '#84cc16';
    if (score >= 2) return '#eab308';
    if (score >= 1) return '#f97316';
    return '#ef4444';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Mood Trend Analysis</span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm ${getTrendColor()}`}>
              {trend === 'stable' ? 'Stable' : trend === 'up' ? 'Improving' : 'Declining'}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: getMoodColor(averageMood) }}>
              {averageMood.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">Average Mood</p>
            <p className="text-xs text-gray-500">{getMoodLabel(averageMood)}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{totalFeedback}</p>
            <p className="text-sm text-gray-600">Total Responses</p>
            <p className="text-xs text-gray-500">{timeframe}</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {data.length > 0 ? (data[data.length - 1].averageMood - data[0].averageMood).toFixed(2) : '0.00'}
            </p>
            <p className="text-sm text-gray-600">Change</p>
            <p className="text-xs text-gray-500">vs Start of Period</p>
          </div>
        </div>

        {/* Trend Chart */}
        <div className="h-64 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis 
                domain={[0, 5]}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={formatTooltip}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '6px'
                }}
              />
              
              {/* Reference lines for mood levels */}
              <ReferenceLine y={3} stroke="#84cc16" strokeDasharray="2 2" opacity={0.5} />
              <ReferenceLine y={2} stroke="#eab308" strokeDasharray="2 2" opacity={0.5} />
              
              <Line 
                type="monotone" 
                dataKey="averageMood" 
                stroke="#2563eb" 
                strokeWidth={3}
                dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: 'white' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mood Distribution for Latest Period */}
        {data.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Latest Period Breakdown</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-green-600">{data[data.length - 1].positiveCount}</p>
                <p className="text-gray-600">Positive</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-600">{data[data.length - 1].neutralCount}</p>
                <p className="text-gray-600">Neutral</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-red-600">{data[data.length - 1].negativeCount}</p>
                <p className="text-gray-600">Negative</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodTrendSection;
