
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

interface InsightItem {
  label: string;
  value: string;
  change: number;
}

interface ComparisonInsightsProps {
  insights: InsightItem[];
  isLoading?: boolean;
}

const ComparisonInsights: React.FC<ComparisonInsightsProps> = ({ insights, isLoading = false }) => {
  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex-1 min-w-[200px] h-16 bg-gray-200 rounded-md"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-4">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className="flex-1 min-w-[200px] p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
            >
              <div className="text-sm text-gray-600 mb-1">{insight.label}</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{insight.value}</span>
                {insight.change !== 0 && (
                  <div 
                    className={`flex items-center ${
                      insight.change > 0 
                        ? 'text-green-600' 
                        : insight.change < 0 
                          ? 'text-red-600' 
                          : 'text-gray-500'
                    }`}
                  >
                    {insight.change > 0 ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : insight.change < 0 ? (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowRight className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm font-medium">
                      {Math.abs(insight.change).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparisonInsights;
