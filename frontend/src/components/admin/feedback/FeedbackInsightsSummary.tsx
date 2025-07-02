
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface InsightItem {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface FeedbackInsightsSummaryProps {
  insights: InsightItem[];
  showComparison?: boolean;
}

const FeedbackInsightsSummary: React.FC<FeedbackInsightsSummaryProps> = ({
  insights,
  showComparison = false
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!showComparison || insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">{insight.label}</span>
                {getTrendIcon(insight.trend)}
              </div>
              <div className="text-2xl font-bold mb-1">{insight.value}</div>
              {showComparison && (
                <div className={`text-sm ${
                  insight.change > 0 ? 'text-green-600' : 
                  insight.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {insight.change > 0 ? '+' : ''}{insight.change}% vs previous
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackInsightsSummary;
