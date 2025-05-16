
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MoodTrendChart from '@/components/charts/MoodTrendChart';
import EmptyDataState from '@/components/charts/EmptyDataState';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  // Calculate if we should show the comparison line
  // We'll show it if comparison is enabled AND we actually have previous period data
  const showComparisonLine = showComparison && hasPreviousPeriodData;
  
  // Debug logs to help troubleshoot
  console.log("MoodTrendSection props:", { 
    showComparison, 
    hasPreviousPeriodData, 
    showComparisonLine,
    dataLength: data.length,
    hasPreviousData: data.some(item => item.previousRating !== undefined)
  });
  
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
        {showComparison && !hasPreviousPeriodData && (
          <Alert variant="default" className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No data available for the previous {comparisonLabel} comparison period. 
              Only current period data will be shown.
            </AlertDescription>
          </Alert>
        )}
        
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
