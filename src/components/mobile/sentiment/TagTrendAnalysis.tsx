
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import EmptyDataState from '@/components/charts/EmptyDataState';

interface TagTrendData {
  tag: string;
  currentCount: number;
  previousCount: number;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
}

interface TagTrendAnalysisProps {
  data?: TagTrendData[];
  isLoading?: boolean;
}

const TagTrendAnalysis: React.FC<TagTrendAnalysisProps> = ({ 
  data = [], 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tag Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tag Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyDataState 
            message="No tag trends available"
            description="Tag trend data will appear here when feedback includes tags."
          />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tag Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Badge variant="outline">{item.tag}</Badge>
                <span className="text-sm text-gray-600">
                  {item.currentCount} mentions
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(item.trend)}
                <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                  {Math.abs(item.changePercentage)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TagTrendAnalysis;
