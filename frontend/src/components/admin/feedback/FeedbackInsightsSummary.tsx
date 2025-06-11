
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

interface Insight {
  id: string;
  type: 'positive' | 'negative' | 'warning' | 'info';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface FeedbackInsightsSummaryProps {
  insights: Insight[];
}

const FeedbackInsightsSummary: React.FC<FeedbackInsightsSummaryProps> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightBadgeVariant = (type: string) => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'negative':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight) => (
            <div key={insight.id} className="flex items-start gap-3 p-3 border rounded-lg">
              {getInsightIcon(insight.type)}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <div className="flex items-center gap-2">
                    {insight.value && (
                      <span className="text-sm font-medium">{insight.value}</span>
                    )}
                    {getTrendIcon(insight.trend)}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
                <Badge variant={getInsightBadgeVariant(insight.type)} className="text-xs">
                  {insight.type.toUpperCase()}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackInsightsSummary;
