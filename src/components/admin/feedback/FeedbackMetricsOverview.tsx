
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Users, MessageSquare, ThumbsUp, Frown } from 'lucide-react';
import { FeedbackMetrics } from '@/services/feedbackAnalyticsService';

interface FeedbackMetricsOverviewProps {
  metrics: FeedbackMetrics;
  comparisonMetrics?: FeedbackMetrics | null;
  comparisonMode?: string;
}

const FeedbackMetricsOverview: React.FC<FeedbackMetricsOverviewProps> = ({
  metrics,
  comparisonMetrics,
  comparisonMode
}) => {
  const getChangePercentage = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const renderMetricCard = (
    title: string,
    value: string | number,
    icon: React.ReactNode,
    previousValue?: number,
    isPercentage = false
  ) => {
    let changeIcon = null;
    let changeColor = 'text-gray-500';
    let changeText = '';

    if (previousValue !== undefined && comparisonMetrics) {
      const current = typeof value === 'string' ? parseFloat(value) : value;
      const change = getChangePercentage(current, previousValue);
      
      if (change > 0) {
        changeIcon = <TrendingUp className="h-4 w-4" />;
        changeColor = 'text-green-600';
        changeText = `+${change.toFixed(1)}%`;
      } else if (change < 0) {
        changeIcon = <TrendingDown className="h-4 w-4" />;
        changeColor = 'text-red-600';
        changeText = `${change.toFixed(1)}%`;
      } else {
        changeIcon = <Minus className="h-4 w-4" />;
        changeColor = 'text-gray-500';
        changeText = '0%';
      }
    }

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
                {isPercentage && '%'}
              </p>
              {changeIcon && (
                <div className={`flex items-center mt-1 ${changeColor}`}>
                  {changeIcon}
                  <span className="ml-1 text-sm font-medium">{changeText}</span>
                </div>
              )}
            </div>
            <div className="text-gray-400">
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {renderMetricCard(
        'Total Feedback',
        metrics.totalCount,
        <MessageSquare className="h-8 w-8" />,
        comparisonMetrics?.totalCount
      )}
      
      {renderMetricCard(
        'Happy Responses',
        metrics.sentimentPercentages.happy,
        <ThumbsUp className="h-8 w-8" />,
        comparisonMetrics?.sentimentPercentages.happy,
        true
      )}
      
      {renderMetricCard(
        'Neutral Responses',
        metrics.sentimentPercentages.neutral,
        <Minus className="h-8 w-8" />,
        comparisonMetrics?.sentimentPercentages.neutral,
        true
      )}
      
      {renderMetricCard(
        'Negative Responses',
        metrics.sentimentPercentages.sad,
        <Frown className="h-8 w-8" />,
        comparisonMetrics?.sentimentPercentages.sad,
        true
      )}
    </div>
  );
};

export default FeedbackMetricsOverview;
