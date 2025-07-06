
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

interface SentimentOverviewProps {
  data: {
    totalFeedback: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

const SentimentOverview: React.FC<SentimentOverviewProps> = ({ data }) => {
  const getTrendIcon = () => {
    switch (data.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalFeedback}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {getTrendIcon()}
            <span className="ml-1">vs last period</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Positive</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{data.positivePercentage}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Neutral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{data.neutralPercentage}%</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Negative</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{data.negativePercentage}%</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentOverview;
