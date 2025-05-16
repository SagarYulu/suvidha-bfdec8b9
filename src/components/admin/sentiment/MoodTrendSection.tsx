
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MoodTrendChart from '@/components/charts/MoodTrendChart';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { AlertTriangle } from 'lucide-react';

interface MoodTrendSectionProps {
  data: Array<{
    date: string;
    rating: number;
    count: number;
    previousRating?: number;
    previousCount?: number;
  }>;
  showComparison?: boolean;
  comparisonLabel?: string;
  hasPreviousPeriodData?: boolean;
}

const MoodTrendSection: React.FC<MoodTrendSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel,
  hasPreviousPeriodData = true
}) => {
  const showComparisonLine = showComparison && hasPreviousPeriodData;
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            Employee Mood Trend Over Time
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
          <MoodTrendChart 
            data={data} 
            showComparison={showComparisonLine} 
          />
        ) : (
          <EmptyDataState message="No mood trend data available for the selected filters." />
        )}
      </CardContent>
    </Card>
  );
};

export default MoodTrendSection;
