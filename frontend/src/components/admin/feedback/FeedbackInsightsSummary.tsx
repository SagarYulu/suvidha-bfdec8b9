
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, MessageSquare, Star, AlertTriangle } from 'lucide-react';

interface FeedbackInsight {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  type: 'positive' | 'negative' | 'neutral';
}

interface FeedbackInsightsSummaryProps {
  insights: FeedbackInsight[];
  isLoading?: boolean;
}

const FeedbackInsightsSummary: React.FC<FeedbackInsightsSummaryProps> = ({
  insights,
  isLoading = false
}) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <Star className="h-5 w-5 text-green-600" />;
      case 'negative':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const getTrendColor = (trend: string, type: string) => {
    if (trend === 'stable') return 'text-gray-600';
    
    // For positive metrics, up is good, down is bad
    if (type === 'positive') {
      return trend === 'up' ? 'text-green-600' : 'text-red-600';
    }
    
    // For negative metrics, down is good, up is bad
    if (type === 'negative') {
      return trend === 'down' ? 'text-green-600' : 'text-red-600';
    }
    
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              {getIcon(insight.type)}
              {insight.trend !== 'stable' && (
                <div className={`flex items-center gap-1 ${getTrendColor(insight.trend, insight.type)}`}>
                  {getTrendIcon(insight.trend)}
                  <span className="text-sm font-medium">
                    {Math.abs(insight.change)}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-gray-600">{insight.title}</h3>
              <p className="text-2xl font-bold">{insight.value}</p>
            </div>
            
            <Badge variant={
              insight.type === 'positive' ? 'default' : 
              insight.type === 'negative' ? 'destructive' : 
              'secondary'
            } className="mt-2">
              {insight.type === 'positive' ? 'Good' : 
               insight.type === 'negative' ? 'Needs Attention' : 
               'Neutral'}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeedbackInsightsSummary;
