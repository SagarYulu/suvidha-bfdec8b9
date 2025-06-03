
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Lightbulb } from 'lucide-react';

interface InsightData {
  label: string;
  value: string;
  change: number;
}

interface FeedbackInsightsSummaryProps {
  insights: InsightData[];
  showComparison: boolean;
}

const FeedbackInsightsSummary: React.FC<FeedbackInsightsSummaryProps> = ({
  insights,
  showComparison
}) => {
  const getInsightBadge = (change: number) => {
    if (!showComparison || change === 0) return null;
    
    if (change > 0) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{change.toFixed(1)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          <TrendingDown className="h-3 w-3 mr-1" />
          {change.toFixed(1)}%
        </Badge>
      );
    }
  };

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Lightbulb className="mr-2 h-5 w-5" />
          Key Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">{insight.label}</h4>
                {getInsightBadge(insight.change)}
              </div>
              <p className="text-lg font-bold text-gray-900">{insight.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackInsightsSummary;
