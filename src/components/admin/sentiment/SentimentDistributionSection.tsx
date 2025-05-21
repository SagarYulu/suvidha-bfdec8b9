
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SentimentPieChart from '@/components/charts/SentimentPieChart';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { AlertTriangle } from 'lucide-react';

interface SentimentDistributionSectionProps {
  data: Array<{
    name: string;
    value: number;
    previousValue?: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
  hasPreviousPeriodData?: boolean;
}

const SentimentDistributionSection: React.FC<SentimentDistributionSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel,
  hasPreviousPeriodData = true
}) => {
  const showComparisonData = showComparison && hasPreviousPeriodData;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Overall Sentiment
            {showComparison && comparisonLabel && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Comparing: {comparisonLabel})
              </span>
            )}
          </span>
          
          {showComparison && !hasPreviousPeriodData && (
            <span className="text-amber-500 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              No previous period data
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <SentimentPieChart data={data} showComparison={showComparisonData} />
        ) : (
          <EmptyDataState message="No sentiment distribution data available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentDistributionSection;
