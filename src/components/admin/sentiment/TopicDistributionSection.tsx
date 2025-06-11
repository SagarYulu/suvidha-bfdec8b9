
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import TopicBarChart from '@/components/charts/TopicBarChart';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { AlertTriangle } from 'lucide-react';

interface TopicDistributionSectionProps {
  data: Array<{
    name: string;
    count: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
  hasPreviousPeriodData?: boolean;
}

const TopicDistributionSection: React.FC<TopicDistributionSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel,
  hasPreviousPeriodData = true
}) => {
  const showComparisonData = showComparison && hasPreviousPeriodData;
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Topic Distribution
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
        {data.length === 0 ? (
          <EmptyDataState 
            message="No feedback topics available for the selected filters."
            subMessage="Try clearing some filters or submitting more detailed feedback."
          />
        ) : (
          <TopicBarChart data={data} showComparison={showComparisonData} />
        )}
      </CardContent>
    </Card>
  );
};

export default TopicDistributionSection;
