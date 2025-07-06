
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TagTrend {
  tag: string;
  currentCount: number;
  previousCount: number;
  change: number;
  changePercentage: number;
}

interface TagTrendAnalysisProps {
  trends: TagTrend[];
  isLoading?: boolean;
}

const TagTrendAnalysis: React.FC<TagTrendAnalysisProps> = ({
  trends,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tag Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (changePercentage: number) => {
    if (changePercentage > 0) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (changePercentage < 0) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (changePercentage: number) => {
    if (changePercentage > 0) return 'text-green-600';
    if (changePercentage < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  // Sort trends by absolute change percentage
  const sortedTrends = [...trends].sort((a, b) => 
    Math.abs(b.changePercentage) - Math.abs(a.changePercentage)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Trending Topics</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTrends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No trend data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTrends.slice(0, 8).map((trend, index) => (
              <div 
                key={trend.tag}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      #{index + 1}
                    </Badge>
                    <span className="font-medium text-sm truncate">
                      {trend.tag}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {trend.currentCount} mentions 
                    {trend.previousCount > 0 && (
                      <span className="ml-1">
                        (was {trend.previousCount})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getTrendIcon(trend.changePercentage)}
                  <span className={`text-sm font-medium ${getTrendColor(trend.changePercentage)}`}>
                    {trend.changePercentage > 0 ? '+' : ''}
                    {trend.changePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TagTrendAnalysis;
