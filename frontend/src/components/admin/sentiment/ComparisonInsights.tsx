
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle } from 'lucide-react';

interface ComparisonInsight {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  significance: 'high' | 'medium' | 'low';
}

interface ComparisonInsightsProps {
  insights: ComparisonInsight[];
  comparisonPeriod: string;
}

const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({
  insights,
  comparisonPeriod
}) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string, metric: string) => {
    // For positive metrics (like satisfaction), up is good
    const positiveMetrics = ['satisfaction', 'positive_sentiment', 'resolution_rate'];
    const isPositiveMetric = positiveMetrics.some(pm => metric.toLowerCase().includes(pm));
    
    if (trend === 'up') {
      return isPositiveMetric ? 'text-green-600' : 'text-red-600';
    } else if (trend === 'down') {
      return isPositiveMetric ? 'text-red-600' : 'text-green-600';
    }
    return 'text-gray-600';
  };

  const getSignificanceBadge = (significance: string) => {
    switch (significance) {
      case 'high':
        return <Badge variant="destructive">High Impact</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Impact</Badge>;
      default:
        return <Badge variant="outline">Low Impact</Badge>;
    }
  };

  const getInsightIcon = (trend: string, significance: string) => {
    if (significance === 'high') {
      return trend === 'up' ? 
        <CheckCircle className="h-5 w-5 text-green-600" /> : 
        <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
    return getTrendIcon(trend);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Insights</CardTitle>
        <p className="text-sm text-gray-600">vs {comparisonPeriod}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.trend, insight.significance)}
                  <h4 className="font-medium">{insight.metric}</h4>
                </div>
                {getSignificanceBadge(insight.significance)}
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Current</p>
                  <p className="font-medium">{insight.current.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Previous</p>
                  <p className="font-medium">{insight.previous.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Change</p>
                  <div className="flex items-center gap-1">
                    <span className={`font-medium ${getTrendColor(insight.trend, insight.metric)}`}>
                      {insight.change > 0 ? '+' : ''}{insight.change.toFixed(1)}
                    </span>
                    <span className={`text-xs ${getTrendColor(insight.trend, insight.metric)}`}>
                      ({insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Insight interpretation */}
              <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                {insight.changePercent > 10 && (
                  <p>📈 Significant {insight.trend === 'up' ? 'increase' : 'decrease'} detected</p>
                )}
                {Math.abs(insight.changePercent) < 5 && (
                  <p>📊 Relatively stable performance</p>
                )}
                {insight.significance === 'high' && (
                  <p>⚠️ Requires immediate attention</p>
                )}
              </div>
            </div>
          ))}
          
          {insights.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No comparison data available for the selected period.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonInsights;
