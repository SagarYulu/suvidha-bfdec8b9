
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface MoodTrendSectionProps {
  data: any[];
  showComparison: boolean;
  comparisonLabel: string;
  hasPreviousPeriodData: boolean;
}

const MoodTrendSection: React.FC<MoodTrendSectionProps> = ({
  data,
  showComparison,
  comparisonLabel,
  hasPreviousPeriodData
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Employee Mood Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <Alert className="bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Mood trend analytics have been removed from this application.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default MoodTrendSection;
