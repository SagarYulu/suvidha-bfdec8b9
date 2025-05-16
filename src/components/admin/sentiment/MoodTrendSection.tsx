
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import MoodTrendChart from '@/components/charts/MoodTrendChart';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MoodTrendSectionProps {
  data: any[];
  showComparison?: boolean;
  comparisonLabel?: string;
  hasPreviousPeriodData?: boolean;
}

const MoodTrendSection: React.FC<MoodTrendSectionProps> = ({ 
  data, 
  showComparison = false,
  comparisonLabel = 'previous',
  hasPreviousPeriodData = false
}) => {
  // Add a log to debug the props
  console.info("MoodTrendSection props:", {
    showComparison,
    hasPreviousPeriodData,
    showComparisonLine: showComparison && hasPreviousPeriodData,
    dataLength: data?.length || 0,
    hasData: Array.isArray(data) && data.length > 0,
    hasPreviousData: Array.isArray(data) && data.some(item => item.previousRating !== undefined)
  });

  // Safe check for data array
  const safeData = Array.isArray(data) ? data : [];
  
  // Only show comparison if we have data with previousRating
  const shouldShowComparison = showComparison && 
                              hasPreviousPeriodData && 
                              safeData.some(item => item.previousRating !== undefined);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">
          Employee Mood Trend Over Time
          {showComparison && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({comparisonLabel} comparison)
            </span>
          )}
        </CardTitle>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-400 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs bg-white">
              <div className="text-sm">
                <p>This chart shows the average employee mood rating over time.</p>
                <p className="mt-2">Each point represents the average rating of all feedback received on that day (1-5 scale).</p>
                {showComparison && (
                  <p className="mt-2 text-blue-600">Showing comparison with {comparisonLabel} period.</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent>
        {safeData.length > 0 ? (
          <MoodTrendChart 
            data={safeData} 
            showComparison={shouldShowComparison} 
          />
        ) : (
          <div className="flex items-center justify-center h-64 bg-gray-50 text-gray-500">
            No mood data available for the selected time period.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodTrendSection;
